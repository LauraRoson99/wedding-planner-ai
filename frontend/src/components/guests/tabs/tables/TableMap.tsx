import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { Table } from "../../types"

type Props = {
  tables: Table[]
  seatsPerTable: number
  onAddGuestToTable: (tableId: number, seatIndex: number) => void
  onRemoveGuestFromTable: (tableId: number, seatIndex: number) => void
  onEditTableName: (tableId: number, newName: string) => void
  onDeleteTable: (tableId: number) => void
  onAddTable: () => void
}

export function TableMap({
  tables,
  seatsPerTable,
  onAddGuestToTable,
  onRemoveGuestFromTable,
  onEditTableName,
  onDeleteTable,
  onAddTable
}: Props) {
  const [editingTableId, setEditingTableId] = useState<number | null>(null)
  const [newTableName, setNewTableName] = useState("")

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {tables.map((table) => (
        <div key={table.id} className="bg-white rounded shadow p-4 text-center">
          <div className="flex justify-between items-center mb-2">
            {editingTableId === table.id ? (
              <div className="flex gap-2 items-center w-full">
                <Input
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onEditTableName(table.id, newTableName)
                      setEditingTableId(null)
                    }
                  }}
                  className="text-center"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onEditTableName(table.id, newTableName)
                    setEditingTableId(null)
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <h4 className="font-semibold text-lg flex-1">
                {table.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => {
                    setEditingTableId(table.id)
                    setNewTableName(table.name)
                  }}
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Button>
              </h4>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteTable(table.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: seatsPerTable }).map((_, i) => {
              const guest = table.guests[i]
              return (
                <div
                  key={i}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-xs text-white cursor-pointer transition ${
                    guest ? guest.color : 'bg-gray-200 text-gray-600'
                  }`}
                  onClick={() => {
                    if (guest) {
                      onRemoveGuestFromTable(table.id, i)
                    } else {
                      onAddGuestToTable(table.id, i)
                    }
                  }}
                >
                  {guest ? guest.name : "Vacío"}
                </div>
              )
            })}
          </div>

          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full flex gap-2 items-center justify-center"
              onClick={() => {
                // Opcional: funcionalidad para añadir desde modal
              }}
            >
              <Plus className="w-4 h-4" /> Añadir invitado
            </Button>
          </div>
        </div>
      ))}

      <div className="bg-white rounded shadow p-4 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition" onClick={onAddTable}>
        <Plus className="w-8 h-8 text-muted-foreground mb-2" />
        <span className="text-muted-foreground">Añadir mesa</span>
      </div>
    </div>
  )
}