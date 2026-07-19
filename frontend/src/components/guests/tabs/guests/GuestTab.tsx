import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type { GuestDto, RsvpStatus, CompanionDto } from "@/features/guests/types";
import type { GroupDto } from "@/features/groups/types";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Trash2, Pencil, UserPlus, UsersRound, Plus, X,
  Upload, Send, SendHorizonal, CheckSquare, Square, Download, Link2, Check,
} from "lucide-react";
import { getWeddingId } from "@/lib/auth";

function normalizeTag(t: string) {
  return t.trim().replace(/\s+/g, " ").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

type GuestFormState = {
  name: string;
  email: string;
  groupId: string;
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
  name: "", email: "", groupId: "", rsvp: "PENDING", allergies: [], notes: "", companions: [],
};

type CsvRow = { name: string; email: string; groupName: string };

const RSVP_CSV_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  DECLINED: "No viene",
};

function guestsToCsv(list: GuestDto[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["Nombre", "Email", "Grupo", "RSVP", "Invitacion enviada", "Alergias", "Acompanantes"];
  const rows = list.map((g) =>
    [
      g.name ?? "",
      g.email ?? "",
      g.group?.name ?? "",
      RSVP_CSV_LABEL[g.rsvp ?? "PENDING"] ?? (g.rsvp ?? ""),
      g.invitationSent ? "Si" : "No",
      (g.allergies ?? []).join("; "),
      (g.companions ?? []).map((c) => c.name).join("; "),
    ]
      .map((x) => esc(String(x)))
      .join(",")
  );
  return [header.map(esc).join(","), ...rows].join("\n");
}

type InvitationOutcome = { id: string; name: string; reason?: string };
type SendInvitationsResult = {
  sent: string[];
  failed: InvitationOutcome[];
  skipped: InvitationOutcome[];
  previews: { id: string; url: string }[];
};

function parseCsv(raw: string): CsvRow[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .map((line) => {
      const cols = line.split(/[,;]/).map((c) => c.trim());
      return { name: cols[0] ?? "", email: cols[1] ?? "", groupName: cols[2] ?? "" };
    })
    .filter((r) => r.name.length > 0);
}

export default function GuestTab() {
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState<GuestDto[]>([]);
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const weddingId = getWeddingId() ?? "";

  // Modal crear/editar
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GuestFormState>(DEFAULT_FORM);
  const [allergyInput, setAllergyInput] = useState("");

  // Selección múltiple para invitaciones
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [inviteResult, setInviteResult] = useState<SendInvitationsResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal importar CSV
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvRaw, setCsvRaw] = useState("");
  const [csvPreview, setCsvPreview] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);

  async function loadGuests() {
    if (!weddingId) { setError("Falta weddingId."); return; }
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
    } catch { /* no romper */ }
  }

  useEffect(() => { loadGuests(); loadGroups(); }, []);

  const filteredGuests = useMemo(
    () => guests.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())),
    [guests, search]
  );

  const allergySuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const g of guests) {
      g.allergies?.forEach((a) => set.add(a.trim()));
      g.companions?.forEach((c) => c.allergies?.forEach((a) => set.add(a.trim())));
    }
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [guests]);

  const filteredAllergySuggestions = useMemo(() => {
    const q = allergyInput.trim().toLowerCase();
    return allergySuggestions.filter((s) => q === "" || s.toLowerCase().includes(q)).slice(0, 16);
  }, [allergyInput, allergySuggestions]);

  // ── Invitaciones ──────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelected(new Set(filteredGuests.map((g) => g.id)));
  }

  function clearSelection() { setSelected(new Set()); }

  async function sendInvitations(ids: string[]) {
    if (!ids.length || sending) return;
    setSending(true);
    setError(null);
    setInviteResult(null);
    try {
      const res = await apiPost<SendInvitationsResult>(
        `/guests/invitation/send?weddingId=${encodeURIComponent(weddingId)}`,
        { guestIds: ids }
      );
      const sentSet = new Set(res.sent);
      setGuests((prev) => prev.map((g) =>
        sentSet.has(g.id) ? { ...g, invitationSent: true, invitationSentAt: new Date().toISOString() } : g
      ));
      setSelected(new Set());
      setInviteResult(res);
    } catch (e: any) {
      setError(e?.message ?? "Error enviando invitaciones");
    } finally {
      setSending(false);
    }
  }

  async function copyRsvpLink(guestId: string) {
    try {
      const res = await apiPost<{ token: string; url: string }>(
        `/guests/${encodeURIComponent(guestId)}/rsvp-link`,
        {}
      );
      await navigator.clipboard.writeText(res.url);
      setCopiedId(guestId);
      setTimeout(() => setCopiedId((c) => (c === guestId ? null : c)), 2000);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo copiar el enlace");
    }
  }

  async function markUnsent(ids: string[]) {
    if (!ids.length) return;
    try {
      await apiPatch(`/guests/invitation/unsent?weddingId=${encodeURIComponent(weddingId)}`, { guestIds: ids });
      setGuests((prev) => prev.map((g) =>
        ids.includes(g.id) ? { ...g, invitationSent: false, invitationSentAt: null } : g
      ));
    } catch (e: any) { setError(e?.message ?? "Error"); }
  }

  // ── CSV Import ────────────────────────────────────────────────
  function handleCsvChange(raw: string) {
    setCsvRaw(raw);
    setCsvPreview(parseCsv(raw));
    setImportResult(null);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleCsvChange(ev.target?.result as string ?? "");
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  }

  async function handleImport() {
    if (!csvPreview.length) return;
    setImporting(true);
    try {
      const result = await apiPost<{ created: number; errors: string[] }>(
        `/guests/import?weddingId=${encodeURIComponent(weddingId)}`,
        { guests: csvPreview }
      );
      setImportResult(result);
      await loadGuests();
      if (result.errors.length === 0) {
        setCsvRaw("");
        setCsvPreview([]);
      }
    } catch (e: any) {
      setError(e?.message ?? "Error en la importación");
    } finally {
      setImporting(false);
    }
  }

  function exportCsv() {
    // Prepend a BOM so Excel reads the UTF-8 accents correctly.
    const csv = "﻿" + guestsToCsv(guests);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invitados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadTemplate() {
    const lines = [
      "# Plantilla de invitados - Planifica2",
      "# Columnas: Nombre (obligatorio), Email (opcional), Grupo (opcional)",
      "# Los grupos deben existir previamente en la aplicacion",
      "# Elimina estas lineas de comentario antes de importar, o dejaslas (se ignoran)",
      "#",
      "Nombre,Email,Grupo",
      "Ana García,ana.garcia@email.com,Familia novia",
      "Carlos García,,Familia novia",
      "Pedro López,pedro@email.com,Amigos novio",
      "Laura Martínez,laura.m@email.com,Amigos novia",
      "Roberto Sánchez,,Compañeros trabajo",
      "Isabel Fernández,isabel@email.com,Familia novio",
      "Miguel Torres,,",
      "Sofía Ramírez,sofia@email.com,Amigos novia",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "plantilla_invitados.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Formulario invitado ───────────────────────────────────────
  function openCreate() { setMode("create"); setEditingId(null); setForm(DEFAULT_FORM); setAllergyInput(""); setOpen(true); }

  function openEdit(guest: GuestDto) {
    setMode("edit");
    setEditingId(guest.id);
    setForm({
      name: guest.name ?? "",
      email: guest.email ?? "",
      groupId: guest.group?.id ?? "",
      rsvp: (guest.rsvp ?? "PENDING") as RsvpStatus,
      allergies: guest.allergies ?? [],
      notes: (guest as any).notes ?? "",
      companions: ((guest.companions ?? []) as CompanionDto[]).map((c) => ({
        id: c.id, name: c.name, ageGroup: (c.ageGroup ?? "ADULT") as "ADULT" | "CHILD" | "BABY",
        allergies: c.allergies ?? [], allergyInput: "",
      })),
    });
    setAllergyInput(""); setOpen(true);
  }

  function rsvpLabel(v: RsvpStatus) {
    if (v === "PENDING") return "Pendiente";
    if (v === "CONFIRMED") return "Confirmado";
    return "No viene";
  }

  function addAllergyTag() {
    const t = normalizeTag(allergyInput);
    if (!t || form.allergies.some((a) => a.toLowerCase() === t.toLowerCase())) { setAllergyInput(""); return; }
    setForm((p) => ({ ...p, allergies: [...p.allergies, t] }));
    setAllergyInput("");
  }

  function removeAllergyTag(tag: string) { setForm((p) => ({ ...p, allergies: p.allergies.filter((t) => t !== tag) })); }

  function toggleAllergy(tag: string) {
    setForm((p) => {
      const exists = p.allergies.some((a) => a.toLowerCase() === tag.toLowerCase());
      return { ...p, allergies: exists ? p.allergies.filter((a) => a.toLowerCase() !== tag.toLowerCase()) : [...p.allergies, tag] };
    });
  }

  function addCompanion() { setForm((p) => ({ ...p, companions: [...p.companions, { name: "", ageGroup: "ADULT", allergies: [], allergyInput: "" }] })); }
  function removeCompanion(idx: number) { setForm((p) => ({ ...p, companions: p.companions.filter((_, i) => i !== idx) })); }
  function updateCompanion(idx: number, patch: Partial<GuestFormState["companions"][number]>) {
    setForm((p) => ({ ...p, companions: p.companions.map((c, i) => i === idx ? { ...c, ...patch } : c) }));
  }
  function updateCompanionAllergyInput(idx: number, value: string) {
    setForm((p) => ({ ...p, companions: p.companions.map((c, i) => i === idx ? { ...c, allergyInput: value } : c) }));
  }
  function addCompanionAllergy(idx: number) {
    setForm((p) => {
      const target = p.companions[idx];
      if (!target) return p;
      const tag = normalizeTag(target.allergyInput ?? "");
      if (!tag || target.allergies.some((a) => a.toLowerCase() === tag.toLowerCase()))
        return { ...p, companions: p.companions.map((c, i) => i === idx ? { ...c, allergyInput: "" } : c) };
      return { ...p, companions: p.companions.map((c, i) => i === idx ? { ...c, allergies: [...c.allergies, tag], allergyInput: "" } : c) };
    });
  }
  function removeCompanionAllergy(idx: number, tag: string) {
    setForm((p) => ({ ...p, companions: p.companions.map((c, i) => i === idx ? { ...c, allergies: c.allergies.filter((a) => a !== tag) } : c) }));
  }
  function toggleCompanionAllergy(idx: number, tag: string) {
    setForm((p) => ({
      ...p, companions: p.companions.map((c, i) => {
        if (i !== idx) return c;
        const exists = c.allergies.some((a) => a.toLowerCase() === tag.toLowerCase());
        return { ...c, allergies: exists ? c.allergies.filter((a) => a.toLowerCase() !== tag.toLowerCase()) : [...c.allergies, tag] };
      })
    }));
  }

  async function submitGuest() {
    if (!weddingId || !form.name.trim()) return;
    const payload = {
      name: form.name.trim(), email: form.email.trim() || undefined, groupId: form.groupId || undefined, rsvp: form.rsvp,
      allergies: form.allergies, notes: form.notes.trim(),
      companions: form.companions.map((c) => ({ id: c.id, name: c.name.trim(), ageGroup: c.ageGroup, allergies: c.allergies })).filter((c) => c.name.length > 0),
    };
    try {
      if (mode === "create") await apiPost(`/guests?weddingId=${encodeURIComponent(weddingId)}`, payload);
      else if (editingId) await apiPut(`/guests/${encodeURIComponent(editingId)}`, payload);
      setOpen(false); setForm(DEFAULT_FORM); setEditingId(null); await loadGuests();
    } catch (e: any) { setError(e?.message ?? "Error guardando invitado"); }
  }

  async function handleDeleteGuest(guest: GuestDto) {
    if (!window.confirm(`¿Eliminar a "${guest.name}"?`)) return;
    try {
      await apiDelete(`/guests/${encodeURIComponent(guest.id)}`);
      await loadGuests();
    } catch (e: any) { setError(e?.message ?? "Error eliminando invitado"); }
  }

  const pendingInvitation = filteredGuests.filter((g) => !g.invitationSent).length;

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h3 className="text-xl font-semibold">Lista de invitados</h3>
          <p className="text-sm text-muted-foreground">
            {guests.length} invitados · {guests.filter((g) => g.invitationSent).length} invitaciones enviadas · {pendingInvitation} pendientes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Botón exportar CSV */}
          <Button variant="outline" onClick={exportCsv} disabled={guests.length === 0} title="Exportar invitados a CSV">
            <Download className="size-4 mr-2" /> Exportar CSV
          </Button>
          {/* Botón importar CSV */}
          <Button variant="outline" onClick={() => { setCsvOpen(true); setImportResult(null); }}>
            <Upload className="size-4 mr-2" /> Importar CSV
          </Button>
          {/* Botón añadir invitado */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <UserPlus className="size-4 mr-2" /> Añadir invitado
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{mode === "create" ? "Nuevo invitado" : "Editar invitado"}</DialogTitle>
                <DialogDescription>Lo importante arriba. Alergias y acompañantes son opcionales.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Nombre</Label>
                  <Input id="guestName" placeholder="Ej: Ana García" value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email</Label>
                  <Input id="guestEmail" type="email" placeholder="ana.garcia@email.com" value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">Necesario para enviarle la invitación por correo.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Grupo</Label>
                    <Select value={form.groupId || "none"} onValueChange={(v) => setForm((p) => ({ ...p, groupId: v === "none" ? "" : v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecciona grupo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin grupo</SelectItem>
                        {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>RSVP</Label>
                    <Select value={form.rsvp} onValueChange={(v) => setForm((p) => ({ ...p, rsvp: v as RsvpStatus }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                        <SelectItem value="DECLINED">No viene</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Alergias / intolerancias (opcional)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Escribe y Enter (ej: gluten)" value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAllergyTag(); } }} />
                    <Button type="button" variant="outline" onClick={addAllergyTag}>Añadir</Button>
                  </div>
                  {form.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.allergies.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
                          {t}
                          <button type="button" onClick={(e) => { e.preventDefault(); removeAllergyTag(t); }}
                            className="text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  {filteredAllergySuggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Sugerencias — click para añadir/quitar</div>
                      <div className="flex flex-wrap gap-2">
                        {filteredAllergySuggestions.map((s) => {
                          const selected = form.allergies.some((a) => a.toLowerCase() === s.toLowerCase());
                          return (
                            <button key={s} type="button" onClick={() => { toggleAllergy(s); setAllergyInput(""); }}
                              className={["rounded-full border px-3 py-1 text-xs transition inline-flex items-center gap-1", selected ? "bg-muted border-muted-foreground/30" : "hover:bg-muted/50"].join(" ")}>
                              {selected && <span aria-hidden>✓</span>}{s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2"><UsersRound className="size-4" /> Acompañantes (opcional)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCompanion}><Plus className="size-4 mr-1" />Añadir</Button>
                  </div>
                  {form.companions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Si viene con pareja/niños, añádelos aquí.</p>
                  ) : (
                    <div className="space-y-3">
                      {form.companions.map((c, idx) => (
                        <div key={c.id ?? idx} className="rounded-xl border bg-muted/20 p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Acompañante {idx + 1}</div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCompanion(idx)}
                              className="text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
                            <Input placeholder="Nombre" value={c.name} onChange={(e) => updateCompanion(idx, { name: e.target.value })} />
                            <Select value={c.ageGroup} onValueChange={(v) => updateCompanion(idx, { ageGroup: v as "ADULT" | "CHILD" | "BABY" })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADULT">Adulto</SelectItem>
                                <SelectItem value="CHILD">Niño</SelectItem>
                                <SelectItem value="BABY">Bebé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Alergias</Label>
                            <div className="flex gap-2">
                              <Input placeholder="Ej: gluten" value={c.allergyInput ?? ""}
                                onChange={(e) => updateCompanionAllergyInput(idx, e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCompanionAllergy(idx); } }} />
                              <Button type="button" variant="outline" onClick={() => addCompanionAllergy(idx)}>Añadir</Button>
                            </div>
                            {c.allergies.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {c.allergies.map((tag) => (
                                  <span key={tag} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
                                    {tag}<button type="button" onClick={(e) => { e.preventDefault(); removeCompanionAllergy(idx, tag); }}
                                      className="text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
                                  </span>
                                ))}
                              </div>
                            )}
                            {allergySuggestions.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {allergySuggestions.slice(0, 10).map((s) => {
                                  const sel = c.allergies.some((a) => a.toLowerCase() === s.toLowerCase());
                                  return (
                                    <button key={s} type="button" onClick={() => toggleCompanionAllergy(idx, s)}
                                      className={["rounded-full border px-3 py-1 text-xs transition inline-flex items-center gap-1", sel ? "bg-muted border-muted-foreground/30" : "hover:bg-muted/50"].join(" ")}>
                                      {sel && <span aria-hidden>✓</span>}{s}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Notas (opcional)</Label>
                  <Textarea placeholder="Ej: amiga de la uni, necesita silla especial..."
                    value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={submitGuest} disabled={!form.name.trim()}>
                  {mode === "create" ? "Crear invitado" : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Barra de acciones bulk */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/40 px-4 py-2">
          <span className="text-sm font-medium">{selected.size} seleccionado{selected.size > 1 ? "s" : ""}</span>
          <Button size="sm" variant="outline" onClick={() => sendInvitations(Array.from(selected))} disabled={sending}>
            <SendHorizonal className="size-4 mr-1" /> {sending ? "Enviando..." : "Enviar invitaciones"}
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>Cancelar selección</Button>
        </div>
      )}

      {/* Resultado del envío de invitaciones */}
      {inviteResult && (
        <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm space-y-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium">
              {inviteResult.sent.length} invitación{inviteResult.sent.length === 1 ? "" : "es"} enviada{inviteResult.sent.length === 1 ? "" : "s"}
              {inviteResult.skipped.length > 0 && ` · ${inviteResult.skipped.length} sin email`}
              {inviteResult.failed.length > 0 && ` · ${inviteResult.failed.length} con error`}
            </span>
            <button type="button" onClick={() => setInviteResult(null)} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          {inviteResult.skipped.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Sin email: {inviteResult.skipped.map((s) => s.name).join(", ")}
            </p>
          )}
          {inviteResult.failed.length > 0 && (
            <ul className="text-xs text-red-600">
              {inviteResult.failed.map((f) => <li key={f.id}>{f.name}: {f.reason}</li>)}
            </ul>
          )}
          {inviteResult.previews.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Previsualización (dev):{" "}
              {inviteResult.previews.map((p, i) => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="text-primary hover:underline mr-2">
                  email {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Búsqueda + seleccionar todos */}
      <div className="flex gap-2">
        <Input className="flex-1" placeholder="Buscar invitado por nombre..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button size="sm" variant="outline" title="Seleccionar todos"
          onClick={selected.size === filteredGuests.length ? clearSelection : selectAllFiltered}>
          {selected.size === filteredGuests.length && filteredGuests.length > 0
            ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
        </Button>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Cargando...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Lista de invitados */}
      <ul className="space-y-3">
        {filteredGuests.map((guest) => (
          <li key={guest.id} className={["rounded-2xl border bg-background shadow-sm transition hover:shadow-md", selected.has(guest.id) ? "ring-2 ring-primary" : ""].join(" ")}>
            <div className="flex items-start justify-between gap-4 p-4">
              {/* Checkbox selección */}
              <button type="button" onClick={() => toggleSelect(guest.id)} className="mt-1 shrink-0 text-muted-foreground hover:text-foreground">
                {selected.has(guest.id) ? <CheckSquare className="size-5 text-primary" /> : <Square className="size-5" />}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-base">{guest.name}</h4>

                  {/* Badge RSVP */}
                  <span className={["rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide border",
                    guest.rsvp === "CONFIRMED" ? "border-green-200 bg-green-50 text-green-700"
                      : guest.rsvp === "DECLINED" ? "border-red-200 bg-red-50 text-red-700"
                        : "border-yellow-200 bg-yellow-50 text-yellow-700"].join(" ")}>
                    {rsvpLabel((guest.rsvp ?? "PENDING") as RsvpStatus)}
                  </span>

                  {/* Badge grupo */}
                  <span className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wide">
                    {guest.group?.name ?? "Sin grupo"}
                  </span>

                  {/* Badge invitación */}
                  {guest.invitationSent ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] uppercase tracking-wide text-blue-700">
                      <Send className="size-3" /> Enviada
                    </span>
                  ) : (
                    <button type="button"
                      onClick={() => sendInvitations([guest.id])}
                      disabled={sending}
                      title={guest.email ? `Enviar invitación a ${guest.email}` : "Este invitado no tiene email"}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted-foreground hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50">
                      <Send className="size-3" /> Enviar
                    </button>
                  )}
                </div>

                {/* Alergias */}
                {(guest.allergies?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {guest.allergies!.map((allergy) => (
                      <span key={allergy} className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-700">{allergy}</span>
                    ))}
                  </div>
                )}

                {/* Acompañantes */}
                {(guest.companions?.length ?? 0) > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Acompañantes</div>
                    {guest.companions!.map((c) => (
                      <div key={c.id ?? c.name} className="ml-2 rounded-xl border bg-muted/30 px-3 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm">{c.name}</span>
                          <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Acompañante</span>
                          {c.ageGroup && (
                            <span className="text-xs text-muted-foreground">
                              {c.ageGroup === "ADULT" ? "Adulto" : c.ageGroup === "CHILD" ? "Niño" : "Bebé"}
                            </span>
                          )}
                        </div>
                        {(c.allergies?.length ?? 0) > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {c.allergies!.map((a) => (
                              <span key={a} className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-700">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(guest as any).notes && (
                  <p className="mt-3 text-sm text-muted-foreground">{(guest as any).notes}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"
                  title={copiedId === guest.id ? "¡Enlace copiado!" : "Copiar enlace de RSVP"}
                  onClick={() => copyRsvpLink(guest.id)}
                  className={copiedId === guest.id ? "text-green-600" : "text-muted-foreground"}>
                  {copiedId === guest.id ? <Check className="size-4" /> : <Link2 className="size-4" />}
                </Button>
                {guest.invitationSent && (
                  <Button variant="ghost" size="icon" title="Desmarcar enviada"
                    onClick={() => markUnsent([guest.id])} className="text-muted-foreground">
                    <X className="size-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(guest)} title="Editar">
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteGuest(guest)}
                  className="text-destructive hover:bg-destructive/10" title="Eliminar">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
        {!loading && filteredGuests.length === 0 && (
          <li className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground italic">Sin resultados.</li>
        )}
      </ul>

      {/* Modal importar CSV */}
      <Dialog open={csvOpen} onOpenChange={(v) => { setCsvOpen(v); if (!v) { setCsvRaw(""); setCsvPreview([]); setImportResult(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar invitados desde CSV</DialogTitle>
            <DialogDescription>
              Pega el contenido del CSV o sube un fichero. Formato: <code>Nombre, Email, Grupo</code> (email y grupo son opcionales).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Descargar plantilla */}
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="size-4 mr-2" /> Descargar plantilla
            </Button>

            {/* Upload fichero */}
            <div className="space-y-2">
              <Label>Subir fichero .csv</Label>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/70 cursor-pointer" />
            </div>

            {/* O pegar texto */}
            <div className="space-y-2">
              <Label>O pegar el contenido aquí</Label>
              <Textarea
                className="font-mono text-xs min-h-32"
                placeholder={"Ana García, ana@gmail.com, Familia novia\nPedro López\nMaría Ruiz, maria@email.com"}
                value={csvRaw}
                onChange={(e) => handleCsvChange(e.target.value)}
              />
            </div>

            {/* Vista previa */}
            {csvPreview.length > 0 && !importResult && (
              <div className="space-y-2">
                <Label>Vista previa — {csvPreview.length} invitado{csvPreview.length > 1 ? "s" : ""} detectado{csvPreview.length > 1 ? "s" : ""}</Label>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Nombre</th>
                        <th className="px-3 py-2 text-left font-medium">Email</th>
                        <th className="px-3 py-2 text-left font-medium">Grupo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{row.email || "—"}</td>
                          <td className="px-3 py-2 text-muted-foreground">{row.groupName || "—"}</td>
                        </tr>
                      ))}
                      {csvPreview.length > 20 && (
                        <tr className="border-t"><td colSpan={3} className="px-3 py-2 text-muted-foreground text-xs">... y {csvPreview.length - 20} más</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Resultado importación */}
            {importResult && (
              <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
                <p className="font-medium text-green-700">✓ {importResult.created} invitado{importResult.created !== 1 ? "s" : ""} importado{importResult.created !== 1 ? "s" : ""} correctamente</p>
                {importResult.errors.length > 0 && (
                  <div>
                    <p className="text-sm text-red-600 font-medium">Errores ({importResult.errors.length}):</p>
                    <ul className="text-xs text-red-600 list-disc list-inside">
                      {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCsvOpen(false)}>Cerrar</Button>
            {!importResult && (
              <Button onClick={handleImport} disabled={csvPreview.length === 0 || importing}>
                {importing ? "Importando..." : `Importar ${csvPreview.length} invitado${csvPreview.length !== 1 ? "s" : ""}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
