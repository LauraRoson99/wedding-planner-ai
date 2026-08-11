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
import { Trash2, Pencil, UsersRound, Eye, User, Heart } from "lucide-react"
import { apiDelete, apiGet, apiPost, apiPatch } from "@/lib/api"
import type { GroupDto } from "@/features/groups/types"
import type { GuestDto, CompanionDto } from "@/features/guests/types"
import { getWeddingId } from "@/lib/auth"
import { toast, toastError } from "@/lib/toast"

function GuestPicker({
  ungrouped,
  selected,
  onToggle,
  getName,
}: {
  ungrouped: GuestDto[]
  selected: Set<string>
  onToggle: (id: string) => void
  getName: (g: GuestDto) => string
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Añadir invitados sin grupo{" "}
        <span className="font-normal text-muted-foreground">(opcional)</span>
      </p>
      {ungrouped.length === 0 ? (
        <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          No hay invitados sin grupo.
        </p>
      ) : (
        <div className="max-h-52 space-y-0.5 overflow-y-auto rounded-xl border p-2">
          {ungrouped.map((g) => (
            <label
              key={g.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={selected.has(g.id)}
                onChange={() => onToggle(g.id)}
              />
              <span className="text-sm">{getName(g)}</span>
            </label>
          ))}
        </div>
      )}
      {selected.size > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.size} seleccionado{selected.size > 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}

export default function GroupTab() {
  const [groups, setGroups] = useState<GroupDto[]>([])
  const [guests, setGuests] = useState<GuestDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newGroupName, setNewGroupName] = useState("")
  const [editingGroup, setEditingGroup] = useState<GroupDto | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<GroupDto | null>(null)
  const [search, setSearch] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [newGroupGuestIds, setNewGroupGuestIds] = useState<Set<string>>(new Set())
  const [editGroupGuestIds, setEditGroupGuestIds] = useState<Set<string>>(new Set())

  const weddingId = getWeddingId() ?? "";

  function toggleInSet(
    setState: (updater: (prev: Set<string>) => Set<string>) => void,
    id: string
  ) {
    setState((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function loadData() {
    if (!weddingId) {
      setError("Falta weddingId. Guárdalo en localStorage para cargar grupos.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [groupsData, guestsData] = await Promise.all([
        apiGet<GroupDto[]>(`/groups?weddingId=${encodeURIComponent(weddingId)}`),
        apiGet<GuestDto[]>(`/guests?weddingId=${encodeURIComponent(weddingId)}`),
      ])

      setGroups(groupsData)
      setGuests(guestsData)
    } catch (e: any) {
      setError(e?.message ?? "Error cargando grupos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
  }, [groups, search])

  const guestsByGroup = useMemo(() => {
    const map = new Map<string, GuestDto[]>()

    for (const guest of guests) {
      const groupId = guest.group?.id
      if (!groupId) continue

      const current = map.get(groupId) ?? []
      current.push(guest)
      map.set(groupId, current)
    }

    return map
  }, [guests])

  const ungroupedGuests = useMemo(
    () => guests.filter((g) => !g.group?.id),
    [guests]
  )

  async function handleAddGroup() {
    if (!weddingId) {
      setError("Falta weddingId en localStorage.")
      return
    }
    if (!newGroupName.trim()) return

    try {
      const created = await apiPost<GroupDto>(
        `/groups?weddingId=${encodeURIComponent(weddingId)}`,
        { name: newGroupName.trim() }
      )
      if (newGroupGuestIds.size > 0) {
        await apiPatch(`/guests/group?weddingId=${encodeURIComponent(weddingId)}`, {
          groupId: created.id,
          guestIds: [...newGroupGuestIds],
        })
      }
      toast.success(
        newGroupGuestIds.size > 0
          ? `Grupo creado con ${newGroupGuestIds.size} invitado${newGroupGuestIds.size === 1 ? "" : "s"}`
          : "Grupo creado"
      )
      setNewGroupName("")
      setNewGroupGuestIds(new Set())
      setCreateOpen(false)
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? "Error creando grupo")
      toastError(e)
    }
  }

  async function handleDeleteGroup(groupId: string) {
    if (!window.confirm("¿Eliminar este grupo? Los invitados quedarán sin grupo.")) return

    try {
      await apiDelete(`/groups/${encodeURIComponent(groupId)}`)
      if (selectedGroup?.id === groupId) setSelectedGroup(null)
      toast.success("Grupo eliminado")
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? "Error eliminando grupo")
      toastError(e)
    }
  }

  async function handleUpdateGroup() {
    if (!editingGroup) return
    if (!editingGroup.name.trim()) return

    try {
      await apiPatch(`/groups/${encodeURIComponent(editingGroup.id)}`, {
        name: editingGroup.name.trim(),
      })
      if (editGroupGuestIds.size > 0) {
        await apiPatch(`/guests/group?weddingId=${encodeURIComponent(weddingId)}`, {
          groupId: editingGroup.id,
          guestIds: [...editGroupGuestIds],
        })
      }
      toast.success("Grupo actualizado")
      setEditGroupGuestIds(new Set())
      await loadData()
      setEditingGroup(null)
    } catch (e: any) {
      setError(e?.message ?? "Error actualizando grupo")
      toastError(e)
    }
  }

  function getGuestName(guest: GuestDto) {
    return guest.name?.trim() || "Invitado sin nombre"
  }

  function getCompanionName(companion: CompanionDto) {
    return companion.name?.trim() || "Acompañante sin nombre"
  }

  function getGroupStats(groupId: string) {
    const groupGuests = guestsByGroup.get(groupId) ?? []
    const companionsCount = groupGuests.reduce(
      (acc, guest) => acc + (guest.companions?.length ?? 0),
      0
    )
    const guestsCount = groupGuests.length
    const totalCount = guestsCount + companionsCount

    return { guestsCount, companionsCount, totalCount, groupGuests }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h3 className="text-xl font-semibold">Grupos</h3>

        <Dialog
          open={createOpen}
          onOpenChange={(o) => {
            setCreateOpen(o)
            if (!o) {
              setNewGroupName("")
              setNewGroupGuestIds(new Set())
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <UsersRound className="size-4 mr-2" />
              Añadir grupo
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo grupo</DialogTitle>
            </DialogHeader>

            <div className="mt-2 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del grupo</label>
                <Input
                  placeholder="Ej: Familia de la novia"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                />
              </div>

              <GuestPicker
                ungrouped={ungroupedGuests}
                selected={newGroupGuestIds}
                onToggle={(id) => toggleInSet(setNewGroupGuestIds, id)}
                getName={getGuestName}
              />

              <div className="flex justify-end">
                <Button onClick={handleAddGroup} disabled={!newGroupName.trim()}>
                  Crear grupo
                </Button>
              </div>
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

      <div className="grid gap-3">
        {filteredGroups.map((group) => {
          const { guestsCount, companionsCount, totalCount, groupGuests } = getGroupStats(group.id)

          const previewNames = groupGuests
            .flatMap((guest) => [
              getGuestName(guest),
              ...(guest.companions?.map((c) => getCompanionName(c)) ?? []),
            ])
            .slice(0, 4)

          return (
            <div
              key={group.id}
              className="rounded-2xl border bg-background p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold">{group.name}</p>

                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {totalCount} persona{totalCount !== 1 && "s"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                      {guestsCount} invitado{guestsCount !== 1 && "s"}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                      {companionsCount} acompañante{companionsCount !== 1 && "s"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {previewNames.length > 0 ? (
                      previewNames.map((name, index) => (
                        <span
                          key={`${group.id}-${name}-${index}`}
                          className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
                        >
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Este grupo todavía no tiene personas asignadas.
                      </span>
                    )}

                    {totalCount > 4 && (
                      <span className="rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground">
                        +{totalCount - 4} más
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end lg:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedGroup(group)}
                    className="mr-1"
                  >
                    <Eye className="size-4 mr-2" />
                    Ver personas
                  </Button>

                  <Button variant="ghost" size="icon" onClick={() => setEditingGroup({ ...group })}
                    aria-label="Editar grupo" title="Editar grupo">
                    <Pencil className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label="Eliminar grupo" title="Eliminar grupo"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!loading && filteredGroups.length === 0 && (
        <p className="text-sm text-muted-foreground italic">Sin resultados.</p>
      )}

      {editingGroup && (
        <Dialog
          open
          onOpenChange={() => {
            setEditingGroup(null)
            setEditGroupGuestIds(new Set())
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar grupo</DialogTitle>
            </DialogHeader>

            <div className="mt-2 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del grupo</label>
                <Input
                  value={editingGroup.name}
                  onChange={(e) =>
                    setEditingGroup({ ...editingGroup, name: e.target.value })
                  }
                  autoFocus
                />
              </div>

              <GuestPicker
                ungrouped={ungroupedGuests}
                selected={editGroupGuestIds}
                onToggle={(id) => toggleInSet(setEditGroupGuestIds, id)}
                getName={getGuestName}
              />

              <div className="flex justify-end">
                <Button onClick={handleUpdateGroup} disabled={!editingGroup.name.trim()}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedGroup && (
        <Dialog open onOpenChange={() => setSelectedGroup(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedGroup.name}</DialogTitle>
            </DialogHeader>

            {(() => {
              const { guestsCount, companionsCount, totalCount, groupGuests } = getGroupStats(
                selectedGroup.id
              )

              return (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {totalCount} persona{totalCount !== 1 && "s"} en total
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {guestsCount} invitado{guestsCount !== 1 && "s"} principales
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {companionsCount} acompañante{companionsCount !== 1 && "s"}
                    </span>
                  </div>

                  {groupGuests.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground italic">
                      Este grupo no tiene invitados asignados todavía.
                    </div>
                  ) : (
                    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                      {groupGuests.map((guest) => {
                        const guestName = getGuestName(guest)

                        return (
                          <div
                            key={guest.id}
                            className="rounded-2xl border bg-muted/30 p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-full border bg-background p-2">
                                <User className="size-4 text-muted-foreground" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="font-medium">{guestName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Invitado principal
                                </p>

                                {(guest.companions?.length ?? 0) > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {guest.companions!.map((companion) => (
                                      <div
                                        key={companion.id ?? `${guest.id}-${companion.name}`}
                                        className="rounded-xl border bg-background p-3"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="mt-0.5 rounded-full border bg-primary/10 p-2">
                                            <Heart className="size-4 text-primary" />
                                          </div>

                                          <div className="min-w-0">
                                            <p className="font-medium">
                                              {getCompanionName(companion)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Acompañante de {guestName}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}