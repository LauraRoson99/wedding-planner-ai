import { useEffect, useMemo, useState } from "react"
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
import { apiDelete, apiGet, apiPost, apiPatch } from "@/lib/api"
import type { GroupDto } from "@/features/groups/types"

export default function GroupTab() {
  const [groups, setGroups] = useState<GroupDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newGroupName, setNewGroupName] = useState("")
  const [editingGroup, setEditingGroup] = useState<GroupDto | null>(null)
  const [search, setSearch] = useState("")

  const weddingId = localStorage.getItem("weddingId") ?? ""

  async function loadGroups() {
    if (!weddingId) {
      setError("Falta weddingId. Guárdalo en localStorage para cargar grupos.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<GroupDto[]>(`/groups?weddingId=${encodeURIComponent(weddingId)}`)
      setGroups(data)
    } catch (e: any) {
      setError(e?.message ?? "Error cargando grupos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
  }, [groups, search])

  async function handleAddGroup() {
    if (!weddingId) {
      setError("Falta weddingId en localStorage.")
      return
    }
    if (!newGroupName.trim()) return

    try {
      await apiPost(`/groups?weddingId=${encodeURIComponent(weddingId)}`, { name: newGroupName.trim() })
      setNewGroupName("")
      await loadGroups()
    } catch (e: any) {
      setError(e?.message ?? "Error creando grupo")
    }
  }

  async function handleDeleteGroup(groupId: string) {
    if (!window.confirm("¿Eliminar este grupo? Los invitados quedarán sin grupo.")) return
    try {
      await apiDelete(`/groups/${encodeURIComponent(groupId)}`)
      await loadGroups()
    } catch (e: any) {
      setError(e?.message ?? "Error eliminando grupo")
    }
  }

  async function handleUpdateGroup() {
    if (!editingGroup) return
    if (!editingGroup.name.trim()) return

    try {
      await apiPatch(`/groups/${encodeURIComponent(editingGroup.id)}`, { name: editingGroup.name.trim() })
      await loadGroups()
      setEditingGroup(null)
    } catch (e: any) {
      setError(e?.message ?? "Error actualizando grupo")
    }
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

      <Input
        placeholder="Buscar grupo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <div className="text-sm text-muted-foreground">Cargando...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <ul className="space-y-2">
        {filteredGroups.map((group) => {
          const guestsCount = group._count?.guests ?? 0
          return (
            <li
              key={group.id}
              className="flex justify-between items-center p-3 rounded border bg-background shadow-sm"
            >
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-xs text-muted-foreground">
                  {guestsCount} invitado{guestsCount !== 1 && "s"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setEditingGroup({ ...group })}>
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
          )
        })}
      </ul>

      {!loading && filteredGroups.length === 0 && (
        <p className="text-sm text-muted-foreground italic">Sin resultados.</p>
      )}

      {editingGroup && (
        <Dialog open onOpenChange={() => setEditingGroup(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar grupo</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Input
                value={editingGroup.name}
                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
              />
              <Button onClick={handleUpdateGroup}>Actualizar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}