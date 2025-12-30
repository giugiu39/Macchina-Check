import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const cls = document.documentElement.classList
    if (dark) { cls.add('dark'); localStorage.setItem('theme', 'dark') }
    else { cls.remove('dark'); localStorage.setItem('theme', 'light') }
  }, [dark])

  return (
    <button
      aria-label="Cambia tema"
      onClick={() => setDark(v => !v)}
      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700"
    >
      {dark ? 'Tema chiaro' : 'Tema scuro'}
    </button>
  )
}