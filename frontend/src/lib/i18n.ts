export const categoryLabels: Record<string, string> = {
  fuel: 'Carburante',
  maintenance: 'Manutenzione',
  insurance: 'Assicurazione',
  tax: 'Tassa di possesso',
  tolls: 'Pedaggi',
  parking: 'Parcheggio',
  repairs: 'Riparazioni',
  other: 'Altro',
  revision: 'Revisione',
}

export const reminderLabels: Record<string, string> = {
  inspection: 'Revisione',
  revision: 'Revisione',
  insurance: 'Assicurazione',
  tax: 'Bollo',
  maintenance: 'Manutenzione',
  service: 'Tagliando',
  tires: 'Pneumatici',
  other: 'Altro',
}

export function fmtCategory(key: string) {
  return categoryLabels[key] || key
}

export function fmtReminder(key: string) {
  return reminderLabels[key] || key
}