import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { api } from './lib/api'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts'
import ThemeToggle from './components/ThemeToggle'

function Layout({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-100 dark:from-gray-900 dark:to-indigo-950">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/60 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">Gestione Veicoli</Link>
          <nav className="flex items-center gap-3">
            <NavLink to="/dashboard" className={({isActive})=>`px-3 py-1 rounded hover:bg-white/80 dark:hover:bg-gray-700 ${isActive?'font-semibold':''}`}>Dashboard</NavLink>
            <NavLink to="/vehicles" className={({isActive})=>`px-3 py-1 rounded hover:bg-white/80 dark:hover:bg-gray-700 ${isActive?'font-semibold':''}`}>Veicoli</NavLink>
            <ThemeToggle />
            {token ? (
              <button className="px-3 py-1 rounded bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900" onClick={()=>{logout(); navigate('/login')}}>Esci</button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-3 py-1 rounded bg-blue-600 text-white">Accedi</Link>
                <Link to="/register" className="px-3 py-1 rounded bg-green-600 text-white">Registrati</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', password:'', confirm_password:'' })
  const [error, setError] = useState<string|null>(null)
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try { await register(form); navigate('/dashboard'); } catch (err:any) { setError(err.message) }
  }
  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">Registrazione</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow">
        {(['first_name','last_name','email','password','confirm_password'] as const).map((key)=> (
          <div key={key}>
            <label className="block text-sm mb-1 capitalize">{key==='first_name'?'Nome': key==='last_name'?'Cognome': key==='email'?'Email': key==='password'?'Password':'Conferma password'}</label>
            <input type={key.includes('password')?'password':(key==='email'?'email':'text')} value={(form as any)[key]} onChange={e=>setForm({...form, [key]: e.target.value})} className="w-full border rounded px-3 py-2" required />
          </div>
        ))}
        <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded md:col-span-2">Crea account</button>
      </form>
    </Layout>
  )
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string|null>(null)
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try { await login(email, password); navigate('/dashboard') } catch (err:any) { setError(err.message) }
  }
  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">Accesso</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3 max-w-md p-6 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Accedi</button>
      </form>
    </Layout>
  )
}

function DashboardPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [error, setError] = useState<string|null>(null)
  const [totalsByCategory, setTotalsByCategory] = useState<Record<string, number>>({})
  const [upcoming, setUpcoming] = useState<any[]>([])

  useEffect(()=>{ (async()=>{
    try{
      const vs = await api.listVehicles()
      setVehicles(vs)
      // Aggregazioni dinamiche
      const totals: Record<string, number> = {}
      const upcomingAll: any[] = []
      for (const v of vs) {
        const exps = await api.listExpenses(v.id)
        exps.forEach((e:any)=>{ totals[e.category] = (totals[e.category]||0) + Number(e.amount) })
        const rems = await api.listReminders(v.id)
        const now = new Date()
        rems.forEach((r:any)=>{
          const due = new Date(r.due_date)
          const days = Math.floor((due.getTime()-now.getTime())/(1000*60*60*24))
          if (days >= -1 && days <= 30) upcomingAll.push({ ...r, vehicle: v, days })
        })
      }
      upcomingAll.sort((a,b)=> a.days - b.days)
      setTotalsByCategory(totals)
      setUpcoming(upcomingAll.slice(0,8))
    } catch(err:any){ setError(err.message) }
  })() },[])

  const pieData = Object.entries(totalsByCategory).map(([category, total])=>({ category, total }))
  const colors = ['#2563eb','#16a34a','#f59e0b','#ef4444','#14b8a6','#9333ea']

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300">Panoramica veicoli, scadenze e spese</p>
      </div>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow">
          <h3 className="font-semibold mb-3">Prossime scadenze (30 giorni)</h3>
          <ul className="space-y-2">
            {upcoming.length === 0 && <li className="text-sm text-gray-500">Nessuna scadenza imminente</li>}
            {upcoming.map((r,i)=> (
              <li key={i} className="flex justify-between items-center">
                <div>
                  <span className="inline-block px-2 py-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 mr-2 capitalize">{r.type}</span>
                  <span className="font-medium">{r.vehicle.make} {r.vehicle.model}</span>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Scadenza {r.due_date}</span>
                </div>
                <span className={`text-sm ${r.days<0?'text-red-600':'text-gray-700 dark:text-gray-200'}`}>{r.days<0?`Scaduto da ${Math.abs(r.days)}g`:`Tra ${r.days}g`}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow">
          <h3 className="font-semibold mb-3">Spese totali per categoria</h3>
          {pieData.length === 0 ? (
            <div className="text-sm text-gray-500">Nessuna spesa registrata</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="total" nameKey="category" innerRadius={50} outerRadius={80}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <section className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow">
          <h3 className="font-semibold mb-3">I tuoi veicoli</h3>
          <ul className="space-y-2">
            {vehicles.map(v=> (
              <li key={v.id} className="p-3 rounded border border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/80 dark:bg-gray-800/80">
                <div>
                  <div className="font-semibold">{v.make} {v.model} {v.year ? `(${v.year})` : ''}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Targa: {v.plate || '—'} • Telaio: {v.vin || '—'}</div>
                </div>
                <Link className="px-3 py-1 rounded bg-blue-600 text-white" to={`/vehicles/${v.id}`}>Gestisci</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  )
}

function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [form, setForm] = useState<any>({ make:'', model:'', year:'', plate:'', vin:'', fuel_type:'', mileage:'', registration_date:'' })
  const [error, setError] = useState<string|null>(null)
  async function refresh() { try{ setVehicles(await api.listVehicles()) } catch(err:any){ setError(err.message) } }
  useEffect(()=>{ refresh() },[])
  async function onSubmit(e: React.FormEvent) { e.preventDefault(); try{ await api.createVehicle({ ...form, year: form.year?Number(form.year):undefined, mileage: form.mileage?Number(form.mileage):undefined }); setForm({ make:'', model:'', year:'', plate:'', vin:'', fuel_type:'', mileage:'', registration_date:'' }); refresh(); } catch(err:any){ setError(err.message) } }
  async function remove(id:number){ try{ await api.deleteVehicle(id); refresh(); } catch(err:any){ setError(err.message) } }
  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">Veicoli</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow">
        {[
          {key:'make', label:'Marca'},
          {key:'model', label:'Modello'},
          {key:'year', label:'Anno'},
          {key:'plate', label:'Targa'},
          {key:'vin', label:'Numero telaio'},
          {key:'fuel_type', label:'Carburante'},
          {key:'mileage', label:'Chilometraggio'},
          {key:'registration_date', label:'Immatricolazione (data)'}
        ].map(({key,label})=> (
          <input key={key} placeholder={label} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} className="border rounded px-3 py-2" />
        ))}
        <button className="px-4 py-2 bg-green-600 text-white rounded md:col-span-3">Aggiungi veicolo</button>
      </form>
      <ul className="mt-4 space-y-2">
        {vehicles.map(v=> (
          <li key={v.id} className="p-3 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center">
            <div>{v.make} {v.model} {v.year?`(${v.year})`:''} • {v.plate||'—'}</div>
            <div className="flex gap-2">
              <Link className="px-2 py-1 rounded bg-blue-600 text-white" to={`/vehicles/${v.id}`}>Dettagli</Link>
              <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={()=>remove(v.id)}>Elimina</button>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

function VehicleDetailPage() {
  const { vehicleId } = useParams()
  const id = Number(vehicleId)
  const [vehicle, setVehicle] = useState<any|null>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [docFiles, setDocFiles] = useState<any[]>([])
  const [error, setError] = useState<string|null>(null)
  useEffect(()=>{ (async()=>{ try{ setVehicle(await api.getVehicle(id)); setExpenses(await api.listExpenses(id)); setReminders(await api.listReminders(id)); setDocFiles(await api.listDocuments(id)); } catch(err:any){ setError(err.message) } })() },[id])

  // Grafico spese per mese
  const monthly = useMemo(()=>{
    const map = new Map<string, number>()
    expenses.forEach(e=>{ const d = e.date? new Date(e.date):null; const k = d? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` : 'Senza data'; map.set(k, (map.get(k)||0)+Number(e.amount)) })
    return Array.from(map.entries()).map(([month, total])=>({ month, total }))
  },[expenses])

  async function addExpense(e: React.FormEvent) {
    e.preventDefault()
    const form = new FormData(e.target as HTMLFormElement)
    const payload:any = {}
    form.forEach((v,k)=> payload[k] = v)
    payload.amount = Number(payload.amount)
    try{ await api.createExpense(id, payload); setExpenses(await api.listExpenses(id)); (e.target as HTMLFormElement).reset() } catch(err:any){ setError(err.message) }
  }

  async function addReminder(e: React.FormEvent) {
    e.preventDefault()
    const form = new FormData(e.target as HTMLFormElement)
    const payload:any = {}
    form.forEach((v,k)=> payload[k] = v)
    try{ await api.createReminder(id, payload); setReminders(await api.listReminders(id)); (e.target as HTMLFormElement).reset() } catch(err:any){ setError(err.message) }
  }

  async function uploadDoc(file: File, expense_id?: number) {
    try{ await api.uploadDocument(id, file, { expense_id }); setDocFiles(await api.listDocuments(id)) } catch(err:any){ setError(err.message) }
  }

  async function removeExpense(expId:number){ try{ await api.deleteExpense(expId); setExpenses(await api.listExpenses(id)) } catch(err:any){ setError(err.message) } }
  async function removeReminder(remId:number){ try{ await api.deleteReminder(remId); setReminders(await api.listReminders(id)) } catch(err:any){ setError(err.message) } }
  async function removeDoc(docId:number){ try{ await api.deleteDocument(docId); setDocFiles(await api.listDocuments(id)) } catch(err:any){ setError(err.message) } }

  return (
    <Layout>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <h2 className="text-2xl font-semibold mb-2">Dettagli veicolo</h2>
      {vehicle && (
        <div className="p-3 bg-white dark:bg-gray-800 rounded shadow mb-4">
          <div className="font-semibold">{vehicle.make} {vehicle.model} {vehicle.year?`(${vehicle.year})`:''}</div>
          <div className="text-sm">Targa: {vehicle.plate || '—'} • Telaio: {vehicle.vin || '—'}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="p-3 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-semibold mb-2">Spese</h3>
          <form onSubmit={addExpense} className="grid grid-cols-2 gap-2 mb-3">
            <select name="category" className="border rounded px-2 py-1">
              {['insurance','tax','revision','maintenance','fuel','other'].map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="title" placeholder="titolo" className="border rounded px-2 py-1" />
            <input name="company" placeholder="compagnia" className="border rounded px-2 py-1" />
            <input name="policy_type" placeholder="tipo polizza" className="border rounded px-2 py-1" />
            <input name="amount" type="number" step="0.01" placeholder="importo" className="border rounded px-2 py-1" required />
            <input name="date" type="date" className="border rounded px-2 py-1" />
            <input name="start_date" type="date" className="border rounded px-2 py-1" />
            <input name="end_date" type="date" className="border rounded px-2 py-1" />
            <input name="due_date" type="date" className="border rounded px-2 py-1" />
            <input name="maintenance_type" placeholder="manutenzione" className="border rounded px-2 py-1" />
            <input name="note" placeholder="note" className="border rounded px-2 py-1 col-span-2" />
            <button className="px-3 py-1 bg-green-600 text-white rounded col-span-2">Aggiungi</button>
          </form>
          <ul className="space-y-2">
            {expenses.map(e=> (
              <li key={e.id} className="flex justify-between">
                <div>{e.category} • {e.title || e.company || '—'} • €{Number(e.amount).toFixed(2)} • {e.due_date || e.date || ''}</div>
                <button className="text-red-600" onClick={()=>removeExpense(e.id)}>Elimina</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="p-3 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-semibold mb-2">Promemoria</h3>
          <form onSubmit={addReminder} className="grid grid-cols-2 gap-2 mb-3">
            <select name="type" className="border rounded px-2 py-1">
              {['insurance','tax','revision','maintenance'].map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="due_date" type="date" className="border rounded px-2 py-1" required />
            <input name="note" placeholder="note" className="border rounded px-2 py-1 col-span-2" />
            <button className="px-3 py-1 bg-blue-600 text-white rounded col-span-2">Aggiungi</button>
          </form>
          <ul className="space-y-2">
            {reminders.map(r=> (
              <li key={r.id} className="flex justify-between">
                <div>{r.type} • Scadenza {r.due_date}</div>
                <button className="text-red-600" onClick={()=>removeReminder(r.id)}>Elimina</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="p-3 bg-white dark:bg-gray-800 rounded shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Grafico spese mensili</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="p-3 bg-white dark:bg-gray-800 rounded shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Documenti</h3>
          <div className="flex items-center gap-2 mb-2">
            <input type="file" onChange={e=> e.target.files && uploadDoc(e.target.files[0])} />
          </div>
          <ul className="space-y-2">
            {docFiles.map(d=> (
              <li key={d.id} className="flex justify-between">
                <a className="text-blue-600" href={d.file_path} target="_blank">{d.file_name}</a>
                <button className="text-red-600" onClick={()=>removeDoc(d.id)}>Elimina</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><div className="text-lg">Benvenuto! Naviga con il menu sopra.</div></Layout>} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} />
    </Routes>
  )
}
