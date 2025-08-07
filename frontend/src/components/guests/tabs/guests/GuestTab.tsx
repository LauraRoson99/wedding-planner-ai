import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const mockGuests = [
  { id: 1, name: "Laura", group: "Amigos de la novia" },
  { id: 2, name: "Dani", group: "Familia del novio" },
  { id: 3, name: "Mario", group: "Amigos de la novia" },
]

export default function GuestTab() {
  const [search, setSearch] = useState("")

  const filteredGuests = mockGuests.filter((guest) =>
    guest.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Lista de invitados</h3>
        <Button>Añadir invitado</Button>
      </div>

      <Input
        placeholder="Buscar invitado por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className="space-y-2">
        {filteredGuests.map((guest) => (
          <li key={guest.id} className="p-2 rounded border bg-background shadow-sm">
            <div className="font-medium">{guest.name}</div>
            <div className="text-sm text-muted-foreground">{guest.group}</div>
          </li>
        ))}
        {filteredGuests.length === 0 && (
          <li className="text-sm text-muted-foreground italic">Sin resultados.</li>
        )}
      </ul>
    </div>
  )
}
