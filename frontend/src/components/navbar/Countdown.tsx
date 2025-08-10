// src/components/navbar/Countdown.tsx
import { useEffect, useMemo, useState } from "react"

type Props = {
  /** ISO con fecha/hora, ej: "2025-10-10T13:00:00" */
  weddingDate: string
  /** Ocultar en móvil si quieres ahorrar espacio */
  hideOnMobile?: boolean
}

export default function Countdown({ weddingDate, hideOnMobile = false }: Props) {
  const target = useMemo(() => new Date(weddingDate).getTime(), [weddingDate])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, target - now)
  if (diff === 0) {
    return (
      <div
        className={`px-3 py-1 rounded-full text-sm font-romantic text-foreground bg-accent/60 backdrop-blur-sm shadow-sm ring-1 ring-primary/20 ${hideOnMobile ? "hidden md:inline-flex" : ""}`}
      >
        💍 ¡Hoy es el gran día! 💖
      </div>
    )
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")

  return (
    <div
      className={`flex items-center gap-2 ${hideOnMobile ? "hidden md:flex" : ""}`}
      aria-label={`Cuenta atrás: ${days} días, ${hours} horas, ${minutes} minutos, ${seconds} segundos`}
    >
      <Segment value={days.toString()} label="días" pulse={false} />
      <Separator />
      <Segment value={pad(hours)} label="horas" pulse={false} />
      <Separator />
      <Segment value={pad(minutes)} label="min" pulse={false} />
      <Separator />
      <Segment value={pad(seconds)} label="seg" pulse />
    </div>
  )
}

function Segment({ value, label, pulse }: { value: string; label: string; pulse?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={[
          "px-3 md:px-3.5 py-0.5 rounded-xl shadow-sm ring-1 ring-primary/20",
          "bg-gradient-to-b from-pink-50 to-rose-50 text-rose-700",
          "dark:from-rose-900/30 dark:to-pink-900/20 dark:text-rose-100",
          "font-romantic text-base md:text-lg tracking-tight select-none",
          pulse ? "animate-heartbeat" : ""
        ].join(" ")}
      >
        {value}
      </div>
      <span className="text-[11px] md:text-[12px] mt-0.5 text-muted-foreground font-script leading-none">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return <span className="opacity-60 text-rose-500 dark:text-rose-300">:</span>
}
