import { Button } from "@/components/ui/button"

const mockGuests = [
  { id: 1, name: "Laura", group: "Amigos de la novia" },
  { id: 2, name: "Dani", group: "Familia del novio" }
]

export default function GuestList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Lista de invitados</h3>
        <Button>Añadir invitado</Button>
      </div>
      <ul className="space-y-2">
        {mockGuests.map((guest) => (
          <li key={guest.id} className="p-2 rounded border bg-background shadow-sm">
            <div className="font-medium">{guest.name}</div>
            <div className="text-sm text-muted-foreground">{guest.group}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
