import { useState } from "react"
import { TableControls } from "./TableControls"
import { TableMap } from "./TableMap"
import { GuestList } from "./GuestList"
import type { Guest, Table } from "../../types"

const mockGuests: Guest[] = [
  { name: "Laura", group: "Amigos de la novia", color: "bg-pink-500" },
  { name: "Dani", group: "Familia del novio", color: "bg-blue-500" },
  { name: "Mario", group: "Amigos de la novia", color: "bg-pink-500" },
]

export default function TableTab() {
  const [tables, setTables] = useState<Table[]>([
    { id: 1, name: "Mesa 1", guests: [mockGuests[0], mockGuests[1]] },
    { id: 2, name: "Mesa 2", guests: [mockGuests[2]] },
  ])
  const [seatsPerTable, setSeatsPerTable] = useState(8)
  const [nextTableId, setNextTableId] = useState(3)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  

  const assignedGuests = tables.flatMap(t => t.guests.filter(Boolean))

  const availableGuests = mockGuests.filter(
    g => !assignedGuests.includes(g)
  )

  const handleUpdate = (numTables: number, seats: number) => {
    setSeatsPerTable(seats)
  }

  const handleAddTable = () => {
    setTables((prev) => [
      ...prev,
      { id: nextTableId, name: `Mesa ${nextTableId}`, guests: [] },
    ])
    setNextTableId((id) => id + 1)
  }

  const handleDeleteTable = (tableId: number) => {
    // Recuperar los invitados de la mesa borrada para que vuelvan a estar disponibles
    const tableToDelete = tables.find((t) => t.id === tableId)
    const guestsToRecover = tableToDelete?.guests ?? []
    setTables((prev) => prev.filter((t) => t.id !== tableId))
    // (Mockeado: no hacemos nada con `guestsToRecover` porque usamos mockGuests como fuente)
  }

  const handleEditTableName = (tableId: number, newName: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, name: newName } : t))
    )
  }

  const handleAddGuestToTable = (tableId: number, seatIndex: number) => {
    if (!selectedGuest) return

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t
        const updatedGuests = [...t.guests]
        updatedGuests[seatIndex] = selectedGuest
        return { ...t, guests: updatedGuests }
      })
    )
    setSelectedGuest(null)
  }

  const handleRemoveGuestFromTable = (tableId: number, seatIndex: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t
        const updatedGuests = [...t.guests]
        updatedGuests[seatIndex] = undefined as any // liberamos el hueco
        return { ...t, guests: updatedGuests }
      })
    )
  }

  return (
    <div className="space-y-6">
      <TableControls onUpdate={handleUpdate} />
      <div className="flex flex-col md:flex-row gap-6">
        <GuestList
          guests={mockGuests}
          assignedGuests={assignedGuests}
          selectedGuest={selectedGuest}
          onSelect={setSelectedGuest}
        />
        <TableMap
          tables={tables}
          seatsPerTable={seatsPerTable}
          onAddGuestToTable={handleAddGuestToTable}
          onRemoveGuestFromTable={handleRemoveGuestFromTable}
          onEditTableName={handleEditTableName}
          onDeleteTable={handleDeleteTable}
          onAddTable={handleAddTable}
        />
      </div>
    </div>
  )
}
