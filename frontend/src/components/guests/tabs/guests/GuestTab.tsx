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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, UserPlus, UsersRound, Plus, X } from "lucide-react";
import { getWeddingId } from "@/lib/auth";

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
  companions: Array<{
    id?: string;
    name: string;
    ageGroup: "ADULT" | "CHILD" | "BABY";
    allergies: string[];
    allergyInput?: string;
  }>;
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

  const weddingId = getWeddingId() ?? "";

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
        id: c.id,
        name: c.name,
        ageGroup: (c.ageGroup ?? "ADULT") as "ADULT" | "CHILD" | "BABY",
        allergies: c.allergies ?? [],
        allergyInput: "",
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
      companions: [
        ...prev.companions,
        { name: "", ageGroup: "ADULT", allergies: [], allergyInput: "" },
      ],
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

  function updateCompanionAllergyInput(idx: number, value: string) {
    setForm((prev) => ({
      ...prev,
      companions: prev.companions.map((c, i) =>
        i === idx ? { ...c, allergyInput: value } : c
      ),
    }));
  }

  function addCompanionAllergy(idx: number) {
    setForm((prev) => {
      const target = prev.companions[idx];
      if (!target) return prev;

      const tag = normalizeTag(target.allergyInput ?? "");
      if (!tag) return prev;

      const exists = target.allergies.some(
        (a) => a.toLowerCase() === tag.toLowerCase()
      );
      if (exists) {
        return {
          ...prev,
          companions: prev.companions.map((c, i) =>
            i === idx ? { ...c, allergyInput: "" } : c
          ),
        };
      }

      return {
        ...prev,
        companions: prev.companions.map((c, i) =>
          i === idx
            ? {
              ...c,
              allergies: [...c.allergies, tag],
              allergyInput: "",
            }
            : c
        ),
      };
    });
  }

  function removeCompanionAllergy(idx: number, tag: string) {
    setForm((prev) => ({
      ...prev,
      companions: prev.companions.map((c, i) =>
        i === idx
          ? {
            ...c,
            allergies: c.allergies.filter((a) => a !== tag),
          }
          : c
      ),
    }));
  }

  function toggleCompanionAllergy(idx: number, tag: string) {
    setForm((prev) => ({
      ...prev,
      companions: prev.companions.map((c, i) => {
        if (i !== idx) return c;

        const exists = c.allergies.some(
          (a) => a.toLowerCase() === tag.toLowerCase()
        );

        return exists
          ? {
            ...c,
            allergies: c.allergies.filter(
              (a) => a.toLowerCase() !== tag.toLowerCase()
            ),
          }
          : {
            ...c,
            allergies: [...c.allergies, tag],
          };
      }),
    }));
  }

  async function submitGuest() {
    if (!weddingId) {
      setError("Falta weddingId en localStorage.");
      return;
    }
    if (!form.name.trim()) return;

    const companionsClean = form.companions
      .map((c) => ({
        id: c.id,
        name: c.name.trim(),
        ageGroup: c.ageGroup,
        allergies: c.allergies,
      }))
      .filter((c) => c.name.length > 0);

    const payload = {
      name: form.name.trim(),
      groupId: form.groupId || undefined,
      rsvp: form.rsvp,
      allergies: form.allergies,
      notes: form.notes.trim(),
      companions: companionsClean,
    };

    try {
      if (mode === "create") {
        await apiPost(`/guests?weddingId=${encodeURIComponent(weddingId)}`, payload);
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
                  <Select
                    value={form.groupId || "none"}
                    onValueChange={(value) =>
                      setForm((p) => ({ ...p, groupId: value === "none" ? "" : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin grupo</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>RSVP</Label>
                  <Select
                    value={form.rsvp}
                    onValueChange={(value) =>
                      setForm((p) => ({ ...p, rsvp: value as RsvpStatus }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado RSVP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                      <SelectItem value="DECLINED">No viene</SelectItem>
                    </SelectContent>
                  </Select>
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
                      Sugerencias{allergyInput.trim() ? " (filtradas)" : ""} — click para añadir/quitar
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
                  <div className="space-y-3">
                    {form.companions.map((c, idx) => (
                      <div
                        key={c.id ?? idx}
                        className="rounded-xl border bg-muted/20 p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            Acompañante {idx + 1}
                          </div>
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

                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
                          <Input
                            placeholder="Nombre del acompañante"
                            value={c.name}
                            onChange={(e) => updateCompanion(idx, { name: e.target.value })}
                          />

                          <Select
                            value={c.ageGroup}
                            onValueChange={(value) =>
                              updateCompanion(idx, {
                                ageGroup: value as "ADULT" | "CHILD" | "BABY",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADULT">Adulto</SelectItem>
                              <SelectItem value="CHILD">Niño</SelectItem>
                              <SelectItem value="BABY">Bebé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Alergias / intolerancias
                          </Label>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Ej: gluten"
                              value={c.allergyInput ?? ""}
                              onChange={(e) => updateCompanionAllergyInput(idx, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addCompanionAllergy(idx);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addCompanionAllergy(idx)}
                            >
                              Añadir
                            </Button>
                          </div>

                          {c.allergies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {c.allergies.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                                >
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      removeCompanionAllergy(idx, tag);
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label={`Quitar ${tag}`}
                                  >
                                    <X className="size-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {allergySuggestions.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">
                                Sugerencias — click para añadir/quitar
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {allergySuggestions.slice(0, 10).map((s) => {
                                  const selected = c.allergies.some(
                                    (a) => a.toLowerCase() === s.toLowerCase()
                                  );

                                  return (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => toggleCompanionAllergy(idx, s)}
                                      className={[
                                        "rounded-full border px-3 py-1 text-xs transition inline-flex items-center gap-1",
                                        selected
                                          ? "bg-muted border-muted-foreground/30"
                                          : "hover:bg-muted/50",
                                      ].join(" ")}
                                      aria-pressed={selected}
                                    >
                                      {selected && <span aria-hidden>✓</span>}
                                      {s}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
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

      <ul className="space-y-3">
        {filteredGuests.map((guest) => (
          <li
            key={guest.id}
            className="rounded-2xl border bg-background shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-base">{guest.name}</h4>

                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide border",
                      guest.rsvp === "CONFIRMED"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : guest.rsvp === "DECLINED"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-yellow-200 bg-yellow-50 text-yellow-700",
                    ].join(" ")}
                  >
                    {rsvpLabel((guest.rsvp ?? "PENDING") as RsvpStatus)}
                  </span>

                  <span className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wide">
                    {guest.group?.name ?? "Sin grupo"}
                  </span>
                </div>

                {(guest as any).allergies?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(guest as any).allergies.map((allergy: string) => (
                      <span
                        key={allergy}
                        className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-700"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                )}

                {(guest.companions?.length ?? 0) > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Acompañantes
                    </div>

                    {guest.companions!.map((c) => (
                      <div
                        key={c.id ?? c.name}
                        className="ml-2 rounded-xl border bg-muted/30 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm">{c.name}</span>

                          <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            Acompañante
                          </span>

                          {c.ageGroup && (
                            <span className="text-xs text-muted-foreground">
                              {c.ageGroup === "ADULT"
                                ? "Adulto"
                                : c.ageGroup === "CHILD"
                                  ? "Niño"
                                  : "Bebé"}
                            </span>
                          )}
                        </div>

                        {(c.allergies?.length ?? 0) > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {c.allergies!.map((allergy) => (
                              <span
                                key={allergy}
                                className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-700"
                              >
                                {allergy}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(guest as any).notes && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {(guest as any).notes}
                  </p>
                )}
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
            </div>
          </li>
        ))}

        {!loading && filteredGuests.length === 0 && (
          <li className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground italic">
            Sin resultados.
          </li>
        )}
      </ul>
    </div>
  );
}