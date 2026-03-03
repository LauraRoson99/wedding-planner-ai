import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import type { GuestDto, RsvpStatus, CompanionDto } from "@/features/guests/types";
import type { GroupDto } from "@/features/groups/types";

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
import { Trash2, Pencil, UserPlus, UsersRound, Plus, X } from "lucide-react";

// ✅ helper: chips de alergias
function normalizeTag(t: string) {
  return t
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type GuestFormState = {
  name: string;
  groupId: string; // "" = sin grupo
  rsvp: RsvpStatus;
  allergies: string[];
  notes: string;
  companions: Array<{ name: string; ageGroup: "ADULT" | "CHILD" | "BABY" }>;
};

const DEFAULT_FORM: GuestFormState = {
  name: "",
  groupId: "",
  rsvp: "PENDING",
  allergies: [],
  notes: "",
  companions: [],
};

export default function GuestTab() {
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState<GuestDto[]>([]);
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weddingId = localStorage.getItem("weddingId") ?? "";

  // modal crear/editar
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GuestFormState>(DEFAULT_FORM);

  // alergias input
  const [allergyInput, setAllergyInput] = useState("");

  async function loadGuests() {
    if (!weddingId) {
      setError("Falta weddingId. Guárdalo en localStorage para cargar invitados.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<GuestDto[]>(`/guests?weddingId=${encodeURIComponent(weddingId)}`);
      setGuests(data);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando invitados");
    } finally {
      setLoading(false);
    }
  }

  async function loadGroups() {
    if (!weddingId) return;
    try {
      const data = await apiGet<GroupDto[]>(`/groups?weddingId=${encodeURIComponent(weddingId)}`);
      setGroups(data);
    } catch {
      // si falla, no rompemos invitados
    }
  }

  useEffect(() => {
    loadGuests();
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  }, [guests, search]);

  const allergySuggestions = useMemo(() => {
    const set = new Set<string>();

    for (const g of guests) {
      (g as any).allergies?.forEach((a: string) => set.add(a.trim()));
      g.companions?.forEach((c: any) =>
        c.allergies?.forEach((a: string) => set.add(a.trim()))
      );
    }

    return Array.from(set)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [guests]);

  const filteredAllergySuggestions = useMemo(() => {
    const q = allergyInput.trim().toLowerCase();

    // mostramos todas si q está vacío
    return allergySuggestions
      .filter((s) => q === "" || s.toLowerCase().includes(q))
      .slice(0, 16);
  }, [allergyInput, allergySuggestions]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setAllergyInput("");
    setOpen(true);
  }

  function openEdit(guest: GuestDto) {
    setMode("edit");
    setEditingId(guest.id);

    setForm({
      name: guest.name ?? "",
      groupId: guest.group?.id ?? "",
      rsvp: (guest.rsvp ?? "PENDING") as RsvpStatus,
      allergies: (guest as any).allergies ?? [], // si aún no lo tienes en DTO, no pasa nada
      notes: (guest as any).notes ?? "",
      companions: ((guest.companions ?? []) as CompanionDto[]).map((c) => ({
        name: c.name,
        ageGroup: (c.ageGroup ?? "ADULT") as "ADULT" | "CHILD" | "BABY",
      })),
    });

    setAllergyInput("");
    setOpen(true);
  }

  function rsvpLabel(v: RsvpStatus) {
    if (v === "PENDING") return "Pendiente";
    if (v === "CONFIRMED") return "Confirmado";
    return "No viene";
  }

  function addAllergyTag() {
    const t = normalizeTag(allergyInput);
    if (!t) return;
    if (form.allergies.some((a) => a.toLowerCase() === t.toLowerCase())) {
      setAllergyInput("");
      return;
    }
    setForm((prev) => ({ ...prev, allergies: [...prev.allergies, t] }));
    setAllergyInput("");
  }

  function removeAllergyTag(tag: string) {
    setForm((prev) => ({ ...prev, allergies: prev.allergies.filter((t) => t !== tag) }));
  }

  function toggleAllergy(tag: string) {
    setForm((prev) => {
      const exists = prev.allergies.some((a) => a.toLowerCase() === tag.toLowerCase());
      if (exists) {
        return { ...prev, allergies: prev.allergies.filter((a) => a.toLowerCase() !== tag.toLowerCase()) };
      }
      return { ...prev, allergies: [...prev.allergies, tag] };
    });
  }

  function addCompanion() {
    setForm((prev) => ({
      ...prev,
      companions: [...prev.companions, { name: "", ageGroup: "ADULT" }],
    }));
  }

  function removeCompanion(idx: number) {
    setForm((prev) => ({
      ...prev,
      companions: prev.companions.filter((_, i) => i !== idx),
    }));
  }

  function updateCompanion(idx: number, patch: Partial<GuestFormState["companions"][number]>) {
    setForm((prev) => ({
      ...prev,
      companions: prev.companions.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  }

  async function submitGuest() {
    if (!weddingId) {
      setError("Falta weddingId en localStorage.");
      return;
    }
    if (!form.name.trim()) return;

    // companions: solo los que tengan nombre
    const companionsClean = form.companions
      .map((c) => ({ ...c, name: c.name.trim() }))
      .filter((c) => c.name.length > 0);

    const payload = {
      name: form.name.trim(),
      groupId: form.groupId || undefined,
      rsvp: form.rsvp,
      allergies: form.allergies,
      notes: form.notes.trim() || undefined
    };

    try {
      if (mode === "create") {
        await apiPost(`/guests?weddingId=${encodeURIComponent(weddingId)}`, {
          ...payload,
          companions: companionsClean
        });
      } else {
        if (!editingId) return;
        await apiPut(`/guests/${encodeURIComponent(editingId)}`, payload);
      }

      setOpen(false);
      setForm(DEFAULT_FORM);
      setEditingId(null);
      await loadGuests();
    } catch (e: any) {
      setError(e?.message ?? "Error guardando invitado");
    }
  }

  async function handleDeleteGuest(guest: GuestDto) {
    const ok = window.confirm(`¿Eliminar a "${guest.name}"?`);
    if (!ok) return;

    try {
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
            Añade invitados rápido y asigna grupo/RSVP al vuelo.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <UserPlus className="size-4 mr-2" />
              Añadir invitado
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>
                {mode === "create" ? "Nuevo invitado" : "Editar invitado"}
              </DialogTitle>
              <DialogDescription>
                Lo importante arriba. Los detalles (alergias y acompañantes) son opcionales.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="guestName">Nombre</Label>
                <Input
                  id="guestName"
                  placeholder="Ej: Ana García"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
              </div>

              {/* Grupo + RSVP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Grupo</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.groupId}
                    onChange={(e) => setForm((p) => ({ ...p, groupId: e.target.value }))}
                  >
                    <option value="">Sin grupo</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>RSVP</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.rsvp}
                    onChange={(e) => setForm((p) => ({ ...p, rsvp: e.target.value as RsvpStatus }))}
                  >
                    <option value="PENDING">{rsvpLabel("PENDING")}</option>
                    <option value="CONFIRMED">{rsvpLabel("CONFIRMED")}</option>
                    <option value="DECLINED">{rsvpLabel("DECLINED")}</option>
                  </select>
                </div>
              </div>

              {/* Alergias (tags rápidas) */}
              <div className="space-y-2">
                <Label>Alergias / intolerancias (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe y Enter (ej: gluten)"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAllergyTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addAllergyTag}>
                    Añadir
                  </Button>
                </div>

                {form.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.allergies.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeAllergyTag(t);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Quitar ${t}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {/* 🔹 Sugerencias */}
                {allergySuggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Sugerencias{allergyInput.trim() ? " (filtradas)" : ""} — clic para añadir/quitar
                    </div>

                    {filteredAllergySuggestions.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic">
                        No hay sugerencias que coincidan.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {filteredAllergySuggestions.map((s) => {
                          const selected = form.allergies.some(
                            (a) => a.toLowerCase() === s.toLowerCase()
                          );

                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                toggleAllergy(s);
                                setAllergyInput("");
                              }}
                              className={[
                                "rounded-full border px-3 py-1 text-xs transition inline-flex items-center gap-1",
                                selected
                                  ? "bg-muted border-muted-foreground/30"
                                  : "hover:bg-muted/50",
                              ].join(" ")}
                              aria-pressed={selected}
                              title={selected ? "Quitar" : "Añadir"}
                            >
                              {selected && <span aria-hidden>✓</span>}
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Acompañantes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <UsersRound className="size-4" />
                    Acompañantes (opcional)
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCompanion}>
                    <Plus className="size-4 mr-1" />
                    Añadir acompañante
                  </Button>
                </div>

                {form.companions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Si viene con pareja/niños, añádelos aquí para tener su info por separado.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.companions.map((c, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder={`Acompañante ${idx + 1} (nombre)`}
                          value={c.name}
                          onChange={(e) => updateCompanion(idx, { name: e.target.value })}
                        />
                        <select
                          className="h-10 rounded-md border bg-background px-2 text-sm"
                          value={c.ageGroup}
                          onChange={(e) =>
                            updateCompanion(idx, { ageGroup: e.target.value as any })
                          }
                        >
                          <option value="ADULT">Adulto</option>
                          <option value="CHILD">Niño</option>
                          <option value="BABY">Bebé</option>
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCompanion(idx)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Quitar"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Input
                  placeholder="Ej: amiga de la uni, necesita silla especial..."
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submitGuest} disabled={!form.name.trim()}>
                {mode === "create" ? "Crear invitado" : "Guardar cambios"}
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
                {guest.group?.name ?? "Sin grupo"} · {rsvpLabel((guest.rsvp ?? "PENDING") as RsvpStatus)}
              </div>

              {(guest.companions?.length ?? 0) > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Acompañantes: {guest.companions!.map((c) => c.name).join(", ")}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(guest)} title="Editar">
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
    </div>
  );
}