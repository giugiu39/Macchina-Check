import React, { useEffect, useState } from 'react'

export function CountUpCard({ title, value, suffix = '', colorFrom = 'from-green-500', colorTo = 'to-fuchsia-500' }: { title: string, value: number, suffix?: string, colorFrom?: string, colorTo?: string }){
  const [display, setDisplay] = useState(0)
  useEffect(()=>{
    const target = Math.round(Number(value) || 0)
    const step = Math.max(1, Math.ceil(target/30))
    let n = 0
    const id = setInterval(()=>{
      n += step
      if (n >= target) { n = target; clearInterval(id) }
      setDisplay(n)
    }, 30)
    return ()=> clearInterval(id)
  },[value])

  return (
    <div className={`p-4 rounded-lg shadow bg-gradient-to-br ${colorFrom} ${colorTo} text-white hover:shadow-lg transition-all`}>
      <div className="text-sm opacity-90">{title}</div>
      <div className="text-3xl font-bold">
        <span>{display.toLocaleString('it-IT')}</span>
        {suffix && <span className="ml-1 text-xl opacity-90">{suffix}</span>}
      </div>
    </div>
  )
}