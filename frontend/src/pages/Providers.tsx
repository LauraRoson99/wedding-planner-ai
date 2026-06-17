import { useEffect, useState } from "react"
import {
  Building2, CheckCircle2, Mail, Handshake, Pencil, Phone,
  Plus, Trash2, Globe, Euro, XCircle, Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  createProvider, deleteProvider, getProviders, updateProvider,
  PROVIDER_CATEGORY_LABELS, PROVIDER_STATUS_LABELS,
} from "@/services/providerService"
import type {
  CreateProviderPayload, Provider, ProviderCategory, ProviderStatus,
} from "@/services/providerService"
import { getWeddingId } from "@/lib/auth"

const STATUS_COLORS: Record<ProviderStatus, string> = {
  CONTACTED: "bg-gray-100 text-gray-700 border-gray-200",
  QUOTED: "bg-blue-100 text-blue-700 border-blue-200",
  BOOKED: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-purple-100 text-purple-700 border-purple-200",
  PAID: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

const EMPTY_FORM: CreateProviderPayload = {
  name: "",
  category: "OTHER",
  status: "CONTACTED",
  contactName: "",
  phone: "",
  email: "",
  website: "",
  estimatedPrice: null,
  finalPrice: null,
  notes: "",
}

export default function Providers() {
  const weddingId = getWeddingId() ?? ""
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateProviderPayload>(EMPTY_FORM)
  const [filterStatus, setFilterStatus] = useState<ProviderStatus | "ALL">("ALL")
  const [filterCategory, setFilterCategory] = useState<ProviderCategory | "ALL">("ALL")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!weddingId) return
    setLoading(true)
    getProviders(weddingId)
      .then(setProviders)
      .finally(() => setLoading(false))
  }, [weddingId])

  const filtered = providers.filter((p) => {
    if (filterStatus !== "ALL" && p.status !== filterStatus) return false
    if (filterCategory !== "ALL" && p.category !== filterCategory) return false
    return true
  })

  const stats = {
    total: providers.length,
    confirmed: providers.filter((p) => p.status === "CONFIRMED" || p.status === "PAID").length,
    pending: providers.filter((p) => ["CONTACTED", "QUOTED", "BOOKED"].includes(p.status)).length,
    cancelled: providers.filter((p) => p.status === "CANCELLED").length,
  }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(p: Provider) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      category: p.category,
      status: p.status,
      contactName: p.contactName ?? "",
      phone: p.phone ?? "",
      email: p.email ?? "",
      website: p.website ?? "",
      estimatedPrice: p.estimatedPrice,
      finalPrice: p.finalPrice,
      notes: p.notes ?? "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload: CreateProviderPayload = {
        ...form,
        contactName: form.contactName || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        notes: form.notes || null,
      }
      if (editingId) {
        const updated = await updateProvider(editingId, payload)
        setProviders((prev) => prev.map((p) => (p.id === editingId ? updated : p)))
      } else {
        const created = await createProvider(weddingId, payload)
        setProviders((prev) => [...prev, created])
      }
      setDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteProvider(id)
    setProviders((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-violet-50 via-background to-purple-50 p-6 shadow-sm dark:from-violet-950/20 dark:via-background dark:to-purple-950/20 md:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-700/20" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-200/50 blur-3xl dark:bg-purple-700/20" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex rounded-full border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
                🤝 Proveedores y servicios
              </div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Gestiona todos tus proveedores.
              </h1>
              <p className="max-w-xl text-muted-foreground md:text-lg">
                Lleva el seguimiento de cada servicio contratado, su estado y la información de contacto en un solo lugar.
              </p>
            </div>
            <Button size="lg" className="rounded-2xl shrink-0" onClick={openCreate}>
              <Plus className="mr-2 h-5 w-5" />
              Añadir proveedor
            </Button>
          </div>
        </section>

        {/* Métricas */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total", value: stats.total, icon: Handshake },
            { label: "Confirmados / Pagados", value: stats.confirmed, icon: CheckCircle2 },
            { label: "En gestión", value: stats.pending, icon: Phone },
            { label: "Cancelados", value: stats.cancelled, icon: XCircle },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-muted p-3">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Filtros */}
        <section className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ProviderStatus | "ALL")}>
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              {(Object.keys(PROVIDER_STATUS_LABELS) as ProviderStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{PROVIDER_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as ProviderCategory | "ALL")}>
            <SelectTrigger className="w-56 rounded-xl">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las categorías</SelectItem>
              {(Object.keys(PROVIDER_CATEGORY_LABELS) as ProviderCategory[]).map((c) => (
                <SelectItem key={c} value={c}>{PROVIDER_CATEGORY_LABELS[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filterStatus !== "ALL" || filterCategory !== "ALL") && (
            <Button variant="outline" size="sm" className="rounded-xl"
              onClick={() => { setFilterStatus("ALL"); setFilterCategory("ALL") }}>
              Limpiar filtros
            </Button>
          )}
        </section>

        {/* Lista */}
        <section>
          {loading ? (
            <Card>
              <CardContent className="p-6 text-muted-foreground">Cargando proveedores...</CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="rounded-2xl border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                {providers.length === 0
                  ? "Aún no tienes proveedores. ¡Añade el primero con el botón de arriba!"
                  : "Ningún proveedor coincide con los filtros seleccionados."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <Card key={p.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{p.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {PROVIDER_CATEGORY_LABELS[p.category]}
                        </p>
                      </div>
                      <Badge
                        className={`shrink-0 border text-xs ${STATUS_COLORS[p.status]}`}
                        variant="outline"
                      >
                        {PROVIDER_STATUS_LABELS[p.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2 text-sm pb-3">
                    {p.contactName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="size-3.5 shrink-0" />
                        <span className="truncate">{p.contactName}</span>
                      </div>
                    )}
                    {p.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="size-3.5 shrink-0" />
                        <span>{p.phone}</span>
                      </div>
                    )}
                    {p.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="size-3.5 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>
                    )}
                    {p.website && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="size-3.5 shrink-0" />
                        <a
                          href={p.website} target="_blank" rel="noreferrer"
                          className="truncate hover:underline text-primary"
                        >
                          {p.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {(p.estimatedPrice != null || p.finalPrice != null) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Euro className="size-3.5 shrink-0" />
                        <span>
                          {p.finalPrice != null
                            ? `${p.finalPrice.toLocaleString("es-ES")} € (precio final)`
                            : `${p.estimatedPrice?.toLocaleString("es-ES")} € (estimado)`}
                        </span>
                      </div>
                    )}
                    {p.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t">
                        {p.notes}
                      </p>
                    )}
                  </CardContent>
                  <div className="flex justify-end gap-2 px-6 pb-5">
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => openEdit(p)}>
                      <Pencil className="size-3.5 mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm" variant="outline" className="rounded-xl text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Diálogo crear / editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 pt-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nombre *</Label>
              <Input
                className="rounded-xl"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del proveedor o empresa"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as ProviderCategory })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PROVIDER_CATEGORY_LABELS) as ProviderCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{PROVIDER_CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as ProviderStatus })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PROVIDER_STATUS_LABELS) as ProviderStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{PROVIDER_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Persona de contacto</Label>
              <Input
                className="rounded-xl"
                value={form.contactName ?? ""}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                placeholder="Nombre del contacto"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                className="rounded-xl"
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+34 600 000 000"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                className="rounded-xl"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contacto@empresa.com"
                type="email"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Web</Label>
              <Input
                className="rounded-xl"
                value={form.website ?? ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Precio estimado (€)</Label>
              <Input
                className="rounded-xl"
                type="number" min={0} step={0.01}
                value={form.estimatedPrice ?? ""}
                onChange={(e) => setForm({
                  ...form, estimatedPrice: e.target.value ? Number(e.target.value) : null,
                })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Precio final (€)</Label>
              <Input
                className="rounded-xl"
                type="number" min={0} step={0.01}
                value={form.finalPrice ?? ""}
                onChange={(e) => setForm({
                  ...form, finalPrice: e.target.value ? Number(e.target.value) : null,
                })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notas</Label>
              <Textarea
                className="min-h-24 rounded-xl"
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observaciones, condiciones, pagos pendientes..."
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-1">
              <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="rounded-xl" onClick={handleSave} disabled={saving || !form.name.trim()}>
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear proveedor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
