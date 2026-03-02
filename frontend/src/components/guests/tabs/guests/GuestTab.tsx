import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { GuestDto } from "@/features/guests/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, UserPlus } from "lucide-react";

export default function GuestTab() {
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState<GuestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<GuestDto | null>(null);
  const [editName, setEditName] = useState("");

  const weddingId = localStorage.getItem("weddingId") ?? "";

  async function loadGuests() {
    if (!weddingId) {
      setError("Falta weddingId. Guárdalo en localStorage para cargar invitados.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<GuestDto[]>(
        `/guests?weddingId=${encodeURIComponent(weddingId)}`
      );
      setGuests(data);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando invitados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [guests, search]);

  async function handleCreateGuest() {
    if (!weddingId) {
      setError("Falta weddingId en localStorage.");
      return;
    }
    if (!createName.trim()) return;

    try {
      await apiPost(`/guests?weddingId=${encodeURIComponent(weddingId)}`, {
        name: createName.trim(),
      });
      setCreateName("");
      setCreateOpen(false);
      await loadGuests();
    } catch (e: any) {
      setError(e?.message ?? "Error creando invitado");
    }
  }

  function openEdit(guest: GuestDto) {
    setEditing(guest);
    setEditName(guest.name);
    setEditOpen(true);
  }

  async function handleUpdateGuest() {
    if (!editing) return;
    if (!editName.trim()) return;

    try {
      // Asumo endpoint PATCH /guests/:id
      await apiPatch(`/guests/${encodeURIComponent(editing.id)}`, {
        name: editName.trim(),
      });
      setEditOpen(false);
      setEditing(null);
      await loadGuests();
    } catch (e: any) {
      setError(e?.message ?? "Error actualizando invitado");
    }
  }

  async function handleDeleteGuest(guest: GuestDto) {
    const ok = window.confirm(`¿Eliminar a "${guest.name}"?`);
    if (!ok) return;

    try {
      // Asumo endpoint DELETE /guests/:id
      await apiDelete(`/guests/${encodeURIComponent(guest.id)}`);
      await loadGuests();
    } catch (e: any) {
      setError(e?.message ?? "Error eliminando invitado");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Lista de invitados</h3>
          <p className="text-sm text-muted-foreground">
            Crea, edita y elimina invitados. Luego ya los asignamos a grupos/mesas.
          </p>
        </div>

        {/* Modal crear */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="size-4 mr-2" />
              Añadir invitado
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo invitado</DialogTitle>
              <DialogDescription>
                Dale un nombre y lo añadimos a la boda actual.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="guestName">Nombre</Label>
              <Input
                id="guestName"
                placeholder="Ej: Laura García"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateGuest();
                }}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateGuest} disabled={!createName.trim()}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Buscar invitado por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <div className="text-sm text-muted-foreground">Cargando...</div>}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <ul className="space-y-2">
        {filteredGuests.map((guest) => (
          <li
            key={guest.id}
            className="flex justify-between items-center p-3 rounded border bg-background shadow-sm"
          >
            <div>
              <div className="font-medium">{guest.name}</div>
              <div className="text-sm text-muted-foreground">
                {guest.group?.name ?? "Sin grupo"}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(guest)}
                title="Editar"
              >
                <Pencil className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteGuest(guest)}
                className="text-destructive hover:bg-destructive/10"
                title="Eliminar"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}

        {!loading && filteredGuests.length === 0 && (
          <li className="text-sm text-muted-foreground italic">Sin resultados.</li>
        )}
      </ul>

      {/* Modal editar */}
      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) {
            setEditing(null);
            setEditName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar invitado</DialogTitle>
            <DialogDescription>
              Cambia el nombre del invitado. (El grupo/mesa lo tocamos en el siguiente paso.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="editGuestName">Nombre</Label>
            <Input
              id="editGuestName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateGuest();
              }}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateGuest} disabled={!editName.trim()}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}