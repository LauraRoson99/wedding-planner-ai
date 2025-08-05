import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  onUpdate: (tables: number, seats: number) => void
}

export function TableControls({ onUpdate }: Props) {
  const [numTables, setNumTables] = useState(1)
  const [numSeats, setNumSeats] = useState(8)

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">Configuración de mesas</h3>
      <div className="flex gap-2">
        <Input
          type="number"
          min={1}
          value={numTables}
          onChange={(e) => setNumTables(Number(e.target.value))}
          placeholder="Número de mesas"
        />
        <Input
          type="number"
          min={1}
          value={numSeats}
          onChange={(e) => setNumSeats(Number(e.target.value))}
          placeholder="Sillas por mesa"
        />
        <Button onClick={() => onUpdate(numTables, numSeats)}>Actualizar</Button>
      </div>
    </div>
  )
}
