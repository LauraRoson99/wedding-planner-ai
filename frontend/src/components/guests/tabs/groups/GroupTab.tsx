import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Pencil } from "lucide-react"

type Group = {
  id: number
  name: string
  guestsCount: number // nuevo campo mockeado
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: "Amigos de la novia", guestsCount: 5 },
    { id: 2, name: "Familia del novio", guestsCount: 8 },
  ])

  const [newGroupName, setNewGroupName] = useState("")
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)

  // Añadir nuevo grupo
  const handleAddGroup = () => {
    if (!newGroupName.trim()) return

    const newGroup: Group = {
      id: Date.now(),
      name: newGroupName.trim(),
      guestsCount: 0, // por defecto
    }

    setGroups((prev) => [...prev, newGroup])
    setNewGroupName("")
  }

  // Eliminar grupo
  const handleDeleteGroup = (id: number) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }

  // Guardar edición
  const handleUpdateGroup = () => {
    if (!editingGroup || !editingGroup.name.trim()) return

    setGroups((prev) =>
      prev.map((g) =>
        g.id === editingGroup.id ? { ...g, name: editingGroup.name } : g
      )
    )

    setEditingGroup(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Grupos</h3>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Añadir grupo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo grupo</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Nombre del grupo"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Button onClick={handleAddGroup}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="space-y-2">
        {groups.map((group) => (
          <li
            key={group.id}
            className="flex justify-between items-center p-3 rounded border bg-background shadow-sm"
          >
            <div>
              <p className="font-medium">{group.name}</p>
              <p className="text-xs text-muted-foreground">
                {group.guestsCount} invitado{group.guestsCount !== 1 && "s"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingGroup(group)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteGroup(group.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Diálogo para editar */}
      {editingGroup && (
        <Dialog open onOpenChange={() => setEditingGroup(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar grupo</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Input
                value={editingGroup.name}
                onChange={(e) =>
                  setEditingGroup({ ...editingGroup, name: e.target.value })
                }
              />
              <Button onClick={handleUpdateGroup}>Actualizar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
