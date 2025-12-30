const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let msg = 'Errore di rete';
    try { const data = await res.json(); msg = data.error || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  // Auth
  register: (payload: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  requestReset: (payload: any) => request('/auth/request-reset', { method: 'POST', body: JSON.stringify(payload) }),
  reset: (payload: any) => request('/auth/reset', { method: 'POST', body: JSON.stringify(payload) }),

  // Vehicles
  listVehicles: () => request('/vehicles'),
  createVehicle: (payload: any) => request('/vehicles', { method: 'POST', body: JSON.stringify(payload) }),
  getVehicle: (id: number) => request(`/vehicles/${id}`),
  updateVehicle: (id: number, payload: any) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteVehicle: (id: number) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  // Expenses
  listExpenses: (vehicleId: number) => request(`/expenses/by-vehicle/${vehicleId}`),
  createExpense: (vehicleId: number, payload: any) => request(`/expenses/by-vehicle/${vehicleId}`, { method: 'POST', body: JSON.stringify(payload) }),
  getExpense: (id: number) => request(`/expenses/${id}`),
  updateExpense: (id: number, payload: any) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExpense: (id: number) => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Reminders
  listReminders: (vehicleId: number) => request(`/reminders/by-vehicle/${vehicleId}`),
  createReminder: (vehicleId: number, payload: any) => request(`/reminders/by-vehicle/${vehicleId}`, { method: 'POST', body: JSON.stringify(payload) }),
  updateReminder: (id: number, payload: any) => request(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteReminder: (id: number) => request(`/reminders/${id}`, { method: 'DELETE' }),
  checkReminders: () => request('/reminders/check', { method: 'POST' }),

  // Documents
  listDocuments: (vehicleId: number) => request(`/documents/by-vehicle/${vehicleId}`),
  uploadDocument: async (vehicleId: number, file: File, payload: any = {}) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(payload).forEach(([k, v]) => { if (v != null) form.append(k, String(v)); });
    const token = getToken();
    const res = await fetch(`${API_URL}/documents/by-vehicle/${vehicleId}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Upload fallito');
    return res.json();
  },
  deleteDocument: (id: number) => request(`/documents/${id}`, { method: 'DELETE' }),
};