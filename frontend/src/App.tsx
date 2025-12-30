import { Link, NavLink, Route, Routes, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { api } from './lib/api'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts'
// Theme toggle rimosso
import { fmtCategory, fmtReminder } from './lib/i18n'
import { CountUpCard } from './components/CountUpCard'

function Layout({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const hideMainNav = location.pathname === '/login' || location.pathname === '/register'
  const isLogin = location.pathname === '/login'
  const isRegister = location.pathname === '/register'
  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-pink-100 to-green-100 dark:from-gray-900 dark:via-fuchsia-950 dark:to-emerald-950 animated-gradient">
      <header className="sticky top-0 z-20 backdrop-blur bg-gradient-to-r from-fuchsia-600/70 to-green-600/70 dark:from-fuchsia-900/60 dark:to-green-900/60 border-b border-transparent">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">CarMan</Link>
          <nav className="flex items-center gap-3">
            {!hideMainNav && (
              <>
                <NavLink to="/dashboard" className={({isActive})=>`px-3 py-1 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 ${isActive?'bg-fuchsia-600 text-white':'bg-white/70 dark:bg-gray-800/70'}`}>Dashboard</NavLink>
                <NavLink to="/vehicles" className={({isActive})=>`px-3 py-1 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 ${isActive?'bg-green-600 text-white':'bg-white/70 dark:bg-gray-800/70'}`}>Veicoli</NavLink>
              </>
            )}
            {isLogin && (
              <div className="flex gap-2">
                <Link to="/" className="px-3 py-1 rounded-md bg-white/70 dark:bg-gray-800/70 transition-all duration-200 hover:shadow-md active:scale-95">Home</Link>
                <Link to="/register" className="px-3 py-1 rounded-md bg-green-600 text-white transition-all duration-200 hover:shadow-md active:scale-95">Registrati</Link>
              </div>
            )}
            {isRegister && (
              <div className="flex gap-2">
                <Link to="/" className="px-3 py-1 rounded-md bg-white/70 dark:bg-gray-800/70 transition-all duration-200 hover:shadow-md active:scale-95">Home</Link>
                <Link to="/login" className="px-3 py-1 rounded-md bg-fuchsia-600 text-white transition-all duration-200 hover:shadow-md active:scale-95">Accedi</Link>
              </div>
            )}
            {!isLogin && !isRegister && (
              token ? (
                <button className="px-3 py-1 rounded-md bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900 transition-all duration-200 hover:shadow-md active:scale-95" onClick={()=>{logout(); navigate('/login')}}>Esci</button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="px-3 py-1 rounded-md bg-fuchsia-600 text-white transition-all duration-200 hover:shadow-md active:scale-95">Accedi</Link>
                  <Link to="/register" className="px-3 py-1 rounded-md bg-green-600 text-white transition-all duration-200 hover:shadow-md active:scale-95">Registrati</Link>
                </div>
              )
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

function LandingPage(){
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-fuchsia-100 via-pink-100 to-green-100 dark:from-gray-900 dark:via-fuchsia-950 dark:to-emerald-950">
      <div className="blobs">
        <div className="blob green" style={{ top: '10%', left: '5%' }}></div>
        <div className="blob fuchsia" style={{ bottom: '15%', right: '10%' }}></div>
        <div className="blob green" style={{ bottom: '30%', left: '40%', animationDuration: '13s' }}></div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ minHeight: '90vh' }}>
        <img src="/carman.svg" alt="CarMan" className="w-24 h-24 mb-4 hover-elevate" />
        <h1 className="text-5xl font-extrabold text-gradient">CarMan</h1>
        <p className="mt-3 text-lg max-w-2xl text-gray-700 dark:text-gray-200">Gestisci veicoli, scadenze e spese con stile. Statistiche, promemoria, documenti e molto altro in un’unica app moderna.</p>
        <div className="mt-6 flex gap-4">
          <Link to="/login" className="px-6 py-3 rounded-lg bg-fuchsia-600 text-white btn-fx">Accedi</Link>
          <Link to="/register" className="px-6 py-3 rounded-lg bg-emerald-600 text-white btn-fx">Registrati</Link>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow card-fx">
            <div className="text-sm text-gray-500 dark:text-gray-400">Organizzazione</div>
            <div className="font-semibold">Veicoli e scadenze</div>
            <div className="text-sm">Promemoria per assicurazione, tassa, revisione e manutenzione.</div>
          </div>
          <div className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow card-fx">
            <div className="text-sm text-gray-500 dark:text-gray-400">Analisi</div>
            <div className="font-semibold">Spese e grafici</div>
            <div className="text-sm">Statistiche per categoria e per mese, con grafici interattivi.</div>
          </div>
          <div className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow card-fx">
            <div className="text-sm text-gray-500 dark:text-gray-400">Archivio</div>
            <div className="font-semibold">Documenti</div>
            <div className="text-sm">Carica e gestisci documenti correlati alle spese del veicolo.</div>
          </div>
        </div>
      </div>
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
        <div className="mt-2 md:col-span-2 flex items-center justify-between">
          <button className="px-4 py-2 bg-green-600 text-white rounded">Crea account</button>
        </div>
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
        <div className="flex items-center justify-between">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Accedi</button>
        </div>
      </form>
    </Layout>
  )
}

function DashboardPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [error, setError] = useState<string|null>(null)
  const [totalsByCategory, setTotalsByCategory] = useState<Record<string, number>>({})
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [sumExpenses, setSumExpenses] = useState(0)

  useEffect(()=>{ (async()=>{
    try{
      const vs = await api.listVehicles()
      setVehicles(vs)
      // Aggregazioni dinamiche
      const totals: Record<string, number> = {}
      const upcomingAll: any[] = []
      let total = 0
      for (const v of vs) {
        const exps = await api.listExpenses(v.id)
        exps.forEach((e:any)=>{ const amt = Number(e.amount)||0; totals[e.category] = (totals[e.category]||0) + amt; total += amt })
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
      setSumExpenses(total)
      setUpcoming(upcomingAll.slice(0,8))
    } catch(err:any){ setError(err.message) }
  })() },[])

  const pieData = Object.entries(totalsByCategory).map(([category, total])=>({ label: fmtCategory(category), total }))
  const colors = ['#2563eb','#16a34a','#f59e0b','#ef4444','#14b8a6','#9333ea']

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300">Panoramica veicoli, scadenze e spese</p>
      </div>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <CountUpCard title="Veicoli" value={vehicles.length} suffix="" colorFrom="from-fuchsia-500" colorTo="to-pink-500" />
        <CountUpCard title="Spese totali" value={sumExpenses} suffix="€" colorFrom="from-green-500" colorTo="to-emerald-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow">
          <h3 className="font-semibold mb-3">Prossime scadenze (30 giorni)</h3>
          <ul className="space-y-2">
            {upcoming.length === 0 && <li className="text-sm text-gray-500">Nessuna scadenza imminente</li>}
            {upcoming.map((r,i)=> {
              const pct = r.days <= 0 ? 100 : Math.max(0, Math.min(100, Math.round(((30 - r.days)/30)*100)))
              return (
                <li key={i} className="p-2 rounded-md bg-white/70 dark:bg-gray-800/70 hover:shadow-md transition-all reveal show">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="inline-block px-2 py-1 rounded bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-200 mr-2">{fmtReminder(r.type)}</span>
                      <span className="font-medium">{r.vehicle.make} {r.vehicle.model}</span>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Scadenza {r.due_date}</span>
                    </div>
                    <span className={`text-sm ${r.days<0?'text-red-600':'text-gray-700 dark:text-gray-200'}`}>{r.days<0?`Scaduto da ${Math.abs(r.days)}g`:`Tra ${r.days}g`}</span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className={`${r.days<0?'bg-red-500':'bg-green-500'} h-full transition-all`} style={{ width: pct + '%' }}></div>
                  </div>
                </li>
              )
            })}
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
                  <Pie data={pieData} dataKey="total" nameKey="label" innerRadius={50} outerRadius={80} isAnimationActive animationDuration={600}>
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
              <li key={v.id} className="p-3 rounded-md border border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/80 dark:bg-gray-800/80 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
                <div>
                  <div className="font-semibold">{v.make} {v.model} {v.year ? `(${v.year})` : ''}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Targa: {v.plate || '—'} • Telaio: {v.vin || '—'}</div>
                </div>
                <Link className="px-3 py-1 rounded-md bg-violet-600 text-white transition-all duration-200 hover:shadow-md active:scale-95" to={`/vehicles/${v.id}`}>Gestisci</Link>
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
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 shadow reveal show">
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
        <button className="px-4 py-2 rounded-md bg-emerald-600 text-white transition-all duration-200 hover:shadow-md active:scale-95 md:col-span-3">Aggiungi veicolo</button>
      </form>
      <ul className="mt-4 space-y-2">
        {vehicles.map(v=> (
          <li key={v.id} className="p-3 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center hover:-translate-y-0.5 hover:shadow-lg transition-transform card-fx">
            <div>{v.make} {v.model} {v.year?`(${v.year})`:''} • {v.plate||'—'}</div>
            <div className="flex gap-2">
              <Link className="px-2 py-1 rounded bg-fuchsia-600 text-white transition-all duration-200 hover:shadow-md active:scale-95 btn-fx" to={`/vehicles/${v.id}`}>Modifica</Link>
              <Link className="px-2 py-1 rounded bg-blue-600 text-white btn-fx" to={`/vehicles/${v.id}`}>Dettagli</Link>
              <button className="px-2 py-1 rounded bg-red-600 text-white btn-fx" onClick={()=>remove(v.id)}>Elimina</button>
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
  const [editing, setEditing] = useState(false)
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
        <div className="p-3 bg-gradient-to-br from-white to-fuchsia-50 dark:from-gray-800 dark:to-fuchsia-900/20 rounded shadow mb-4 card-fx">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-lg">{vehicle.make} {vehicle.model} {vehicle.year?`(${vehicle.year})`:''}</div>
              <div className="text-sm">Targa: {vehicle.plate || '—'} • Telaio: {vehicle.vin || '—'}</div>
            </div>
            <button className="px-2 py-1 rounded bg-fuchsia-600 text-white transition-all duration-200 hover:shadow-md active:scale-95 btn-fx" onClick={()=>setEditing(v=>!v)}>{editing?'Annulla':'Modifica'}</button>
          </div>
          {editing && (
            <form className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3" onSubmit={async (e)=>{
              e.preventDefault()
              const form = new FormData(e.target as HTMLFormElement)
              const payload:any = {}
              form.forEach((v,k)=> payload[k] = v)
              payload.year = payload.year? Number(payload.year): null
              payload.mileage = payload.mileage? Number(payload.mileage): null
              try{ await api.updateVehicle(id, payload); setVehicle(await api.getVehicle(id)); setEditing(false) } catch(err:any){ setError(err.message) }
            }}>
              {[
                {key:'make', label:'Marca', value: vehicle.make||''},
                {key:'model', label:'Modello', value: vehicle.model||''},
                {key:'year', label:'Anno', value: vehicle.year||''},
                {key:'plate', label:'Targa', value: vehicle.plate||''},
                {key:'vin', label:'Numero telaio', value: vehicle.vin||''},
                {key:'fuel_type', label:'Carburante', value: vehicle.fuel_type||''},
                {key:'mileage', label:'Chilometraggio', value: vehicle.mileage||''},
                {key:'registration_date', label:'Immatricolazione (data)', value: vehicle.registration_date||''},
              ].map(({key,label,value})=> (
                <input key={key} name={key} defaultValue={value} placeholder={label} className="border rounded px-3 py-2" />
              ))}
              <button className="px-4 py-2 rounded-md bg-green-600 text-white transition-all duration-200 hover:shadow-md active:scale-95 md:col-span-3">Salva modifiche</button>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sezione solo form Spese */}
        <section className="p-3 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-semibold mb-2">Aggiungi spesa</h3>
          <ExpenseForm onSubmit={addExpense} />
        </section>

        {/* Sezione solo form Promemoria */}
        <section className="p-3 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-semibold mb-2">Aggiungi promemoria</h3>
          <form onSubmit={addReminder} className="grid grid-cols-2 gap-2 mb-3">
            <select name="type" className="border rounded px-2 py-1">
              {['insurance','tax','revision','maintenance'].map(c=> <option key={c} value={c}>{fmtReminder(c)}</option>)}
            </select>
            <input name="due_date" type="date" className="border rounded px-2 py-1" required />
            <input name="note" placeholder="Note" className="border rounded px-2 py-1 col-span-2" />
            <button className="px-3 py-1 bg-blue-600 text-white rounded col-span-2">Aggiungi</button>
          </form>
        </section>

        {/* Sezione dedicata elenco Spese */}
        <section className="p-3 bg-white dark:bg-gray-800 rounded shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Spese</h3>
          <ExpenseList expenses={expenses} onDelete={removeExpense} />
        </section>

        {/* Sezione dedicata elenco Promemoria */}
        <section className="p-3 bg-white dark:bg-gray-800 rounded shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Promemoria</h3>
          <ul className="space-y-2">
            {reminders.map(r=> (
              <li key={r.id} className="flex justify-between">
                <div>{fmtReminder(r.type)} • Scadenza {r.due_date}</div>
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
                <Bar dataKey="total" fill="#8b5cf6" isAnimationActive animationDuration={600} />
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
                 <a className="text-violet-600 hover:underline" href={d.file_path} target="_blank">{d.file_name}</a>
                 <button className="text-red-600" onClick={()=>removeDoc(d.id)}>Elimina</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  )
}

function ExpenseForm({ onSubmit }: { onSubmit: (e: React.FormEvent)=>void }){
  const [cat, setCat] = useState('insurance')
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-2 mb-3">
      <select name="category" value={cat} onChange={e=>setCat(e.target.value)} className="border rounded px-2 py-1">
        {['insurance','tax','revision','maintenance','fuel','other'].map(c=> <option key={c} value={c}>{fmtCategory(c)}</option>)}
      </select>
      {/* Data spesa uguale per tutte */}
      <input name="date" type="date" className="border rounded px-2 py-1" />
      {/* Campi dinamici per categoria */}
      {cat === 'insurance' && (
        <>
          <input name="company" placeholder="Compagnia assicurativa" className="border rounded px-2 py-1" />
          <input name="policy_type" placeholder="Tipo di polizza" className="border rounded px-2 py-1" />
          <input name="amount" type="number" step="0.01" placeholder="Importo pagato" className="border rounded px-2 py-1 col-span-2" required />
        </>
      )}
      {cat === 'tax' && (
        <input name="amount" type="number" step="0.01" placeholder="Importo pagato" className="border rounded px-2 py-1" required />
      )}
      {cat === 'revision' && (
        <>
          <input name="title" placeholder="Tipo di revisione" className="border rounded px-2 py-1" />
          <input name="amount" type="number" step="0.01" placeholder="Importo pagato" className="border rounded px-2 py-1" required />
        </>
      )}
      {cat === 'maintenance' && (
        <>
          <input name="maintenance_type" placeholder="Tipo manutenzione" className="border rounded px-2 py-1" />
          <input name="amount" type="number" step="0.01" placeholder="Importo pagato" className="border rounded px-2 py-1" required />
        </>
      )}
      {cat === 'fuel' && (
        <input name="amount" type="number" step="0.01" placeholder="Importo pagato" className="border rounded px-2 py-1" required />
      )}
      {cat === 'other' && (
        <>
          <input name="title" placeholder="Titolo" className="border rounded px-2 py-1" />
          <input name="amount" type="number" step="0.01" placeholder="Costo" className="border rounded px-2 py-1" required />
        </>
      )}
      {/* Note uguale per tutte */}
      <input name="note" placeholder="Note" className="border rounded px-2 py-1 col-span-2" />
      <button className="px-3 py-1 bg-green-600 text-white rounded col-span-2">Aggiungi</button>
    </form>
  )
}

function ExpenseList({ expenses, onDelete }: { expenses: any[], onDelete: (id:number)=>void }){
  function details(e:any){
    const amt = `€${Number(e.amount).toFixed(2)}`
    switch(e.category){
      case 'insurance': return `Compagnia: ${e.company || '—'} • Tipo: ${e.policy_type || '—'} • ${amt}`
      case 'tax': return `Importo: ${amt}`
      case 'revision': return `Tipo revisione: ${e.title || '—'} • Importo pagato: ${amt}`
      case 'maintenance': return `Tipo manutenzione: ${e.maintenance_type || '—'} • Importo pagato: ${amt}`
      case 'fuel': return `Importo pagato: ${amt}`
      default: return `${amt} • ${e.title || '—'}`
    }
  }
  return (
    <ul className="space-y-2">
      {expenses.map(e=> (
        <li key={e.id} className="flex justify-between items-start">
          <div>
            <div className="font-medium">{fmtCategory(e.category)} • {details(e)}</div>
            {e.date && (
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                <span className="inline-block px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">Data spesa: {new Date(e.date).toLocaleDateString('it-IT')}</span>
              </div>
            )}
            {e.note && (
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">Nota: {e.note}</div>
            )}
          </div>
          <button className="text-red-600" onClick={()=>onDelete(e.id)}>Elimina</button>
        </li>
      ))}
    </ul>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} />
    </Routes>
  )
}
