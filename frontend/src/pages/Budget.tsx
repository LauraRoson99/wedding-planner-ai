import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Euro,
  PiggyBank,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createBudgetItem,
  deleteBudgetItem,
  getBudgetSummary,
  updateBudgetItem,
  updateBudgetSettings,
} from "@/services/budgetService"
import type {
  BudgetCategory,
  BudgetItem,
  BudgetItemStatus,
  BudgetSummary,
} from "@/services/budgetService"
import { getWeddingId } from "@/lib/auth"

const categoryLabels: Record<BudgetCategory, string> = {
  VENUE: "Finca / espacio",
  CATERING: "Banquete",
  DRESS: "Vestido",
  SUIT: "Traje",
  PHOTO_VIDEO: "Foto y vídeo",
  MUSIC: "Música",
  DECORATION: "Decoración",
  FLOWERS: "Flores",
  TRANSPORT: "Transporte",
  INVITATIONS: "Invitaciones",
  HONEYMOON: "Luna de miel",
  BEAUTY: "Belleza",
  CEREMONY: "Ceremonia",
  GIFTS: "Regalos",
  OTHER: "Otros",
}

const statusLabels: Record<BudgetItemStatus, string> = {
  PLANNED: "Planificado",
  CONFIRMED: "Confirmado",
  PAID: "Pagado",
  CANCELLED: "Cancelado",
}

const chartColors = [
  "#fb7185",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
]

const initialForm = {
  name: "",
  category: "OTHER" as BudgetCategory,
  estimatedAmount: "",
  actualAmount: "",
  paidAmount: "",
  status: "PLANNED" as BudgetItemStatus,
  dueDate: "",
  paymentDate: "",
  supplier: "",
  notes: "",
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string | null) {
  if (!date) return "Sin fecha"

  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function Budget() {
  const [budget, setBudget] = useState<BudgetSummary | null>(null)
  const [totalBudgetInput, setTotalBudgetInput] = useState("")
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const weddingId = getWeddingId() ?? "";

  async function loadBudget() {
    if (!weddingId) {
      setError("No se ha encontrado ninguna boda seleccionada.")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await getBudgetSummary(weddingId)
      setBudget(data)
      setTotalBudgetInput(String(data.budget.totalAmount || ""))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se ha podido cargar el presupuesto."
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBudget()
  }, [])

  async function handleSaveBudgetSettings() {
    if (!weddingId) return

    try {
      setIsSaving(true)

      await updateBudgetSettings(weddingId, {
        totalAmount: Number(totalBudgetInput) || 0,
        currency: "EUR",
      })

      await loadBudget()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se ha podido guardar el presupuesto."
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!weddingId) return

    if (!form.name.trim()) {
      setError("El gasto necesita un nombre.")
      return
    }

    if (!form.estimatedAmount || Number(form.estimatedAmount) < 0) {
      setError("El importe estimado no es válido.")
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      await createBudgetItem(weddingId, {
        name: form.name.trim(),
        category: form.category,
        estimatedAmount: Number(form.estimatedAmount),
        actualAmount: form.actualAmount ? Number(form.actualAmount) : null,
        paidAmount: form.paidAmount ? Number(form.paidAmount) : 0,
        status: form.status,
        dueDate: form.dueDate || null,
        paymentDate: form.paymentDate || null,
        supplier: form.supplier || null,
        notes: form.notes || null,
      })

      setForm(initialForm)
      await loadBudget()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se ha podido crear el gasto."
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteItem(id: string) {
    try {
      setIsSaving(true)
      await deleteBudgetItem(id)
      await loadBudget()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se ha podido eliminar el gasto."
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function markAsPaid(item: BudgetItem) {
    try {
      setIsSaving(true)

      await updateBudgetItem(item.id, {
        status: "PAID",
        paidAmount: item.actualAmount ?? item.estimatedAmount,
        paymentDate: new Date().toISOString(),
      })

      await loadBudget()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se ha podido marcar como pagado."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const categoryChartData = useMemo(() => {
    return (
      budget?.categories.map((item) => ({
        name: categoryLabels[item.category as BudgetCategory] ?? item.category,
        value: item.actual,
      })) ?? []
    )
  }, [budget])

  const monthlyChartData = useMemo(() => {
    return (
      budget?.monthly.map((item) => ({
        month: item.month,
        Estimado: item.estimated,
        Real: item.actual,
        Pagado: item.paid,
      })) ?? []
    )
  }, [budget])

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            Cargando presupuesto...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-destructive">
            {error ?? "No se ha podido cargar el presupuesto."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const summary = budget.summary

  return (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-rose-50 via-background to-pink-50 p-6 shadow-sm dark:from-rose-950/20 dark:via-background dark:to-pink-950/20 md:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-700/20" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-pink-200/50 blur-3xl dark:bg-pink-700/20" />

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex rounded-full border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
                💸 Presupuesto de la boda
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Controla cada gasto sin perder la cabeza.
                </h1>

                <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
                  Registra pagos, compara estimaciones con gastos reales y detecta rápido
                  qué categorías se están llevando más presupuesto.
                </p>
              </div>
            </div>

            <Card className="border-0 bg-background/85 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle>Presupuesto total</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBudget">Importe máximo</Label>

                  <div className="flex gap-2">
                    <Input
                      id="totalBudget"
                      type="number"
                      min="0"
                      value={totalBudgetInput}
                      onChange={(event) =>
                        setTotalBudgetInput(event.target.value)
                      }
                      placeholder="Ej. 20000"
                      className="rounded-xl"
                    />

                    <Button
                      onClick={handleSaveBudgetSettings}
                      disabled={isSaving}
                      className="rounded-xl"
                    >
                      Guardar
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Uso del presupuesto
                    </span>
                    <span className="font-medium">
                      {summary.budgetUsagePercentage}%
                    </span>
                  </div>

                  <Progress value={summary.budgetUsagePercentage} />
                </div>

                <p className="text-sm text-muted-foreground">
                  {formatCurrency(summary.totalActual)} gastados de{" "}
                  {formatCurrency(summary.totalBudget)}.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {error && (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="p-4 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-muted p-3">
                <Wallet className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Presupuesto</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalBudget)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-muted p-3">
                <Euro className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Gasto real</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalActual)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-muted p-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Pagado</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalPaid)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-muted p-3">
                <PiggyBank className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Restante</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.remainingBudget)}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Añadir gasto</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateItem} className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="expenseName">Nombre del gasto</Label>
                  <Input
                    id="expenseName"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Ej. Banquete, fotógrafo, vestido..."
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        category: value as BudgetCategory,
                      }))
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>

                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        status: value as BudgetItemStatus,
                      }))
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>

                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedAmount">Importe estimado</Label>
                  <Input
                    id="estimatedAmount"
                    type="number"
                    min="0"
                    value={form.estimatedAmount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        estimatedAmount: event.target.value,
                      }))
                    }
                    placeholder="0"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualAmount">Importe real</Label>
                  <Input
                    id="actualAmount"
                    type="number"
                    min="0"
                    value={form.actualAmount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        actualAmount: event.target.value,
                      }))
                    }
                    placeholder="Opcional"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paidAmount">Importe pagado</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    min="0"
                    value={form.paidAmount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        paidAmount: event.target.value,
                      }))
                    }
                    placeholder="0"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha límite</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Proveedor</Label>
                  <Input
                    id="supplier"
                    value={form.supplier}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        supplier: event.target.value,
                      }))
                    }
                    placeholder="Opcional"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Fecha de pago</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={form.paymentDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        paymentDate: event.target.value,
                      }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Detalles, condiciones, pagos pendientes..."
                    className="min-h-24 rounded-xl"
                  />
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full rounded-xl"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir gasto
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por categoría</CardTitle>
              </CardHeader>

              <CardContent className="h-80">
                {categoryChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Añade gastos para ver la distribución.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={4}
                      >
                        {categoryChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolución mensual</CardTitle>
              </CardHeader>

              <CardContent className="h-80">
                {monthlyChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Añade fechas a tus gastos para ver la evolución mensual.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="Estimado" fill="#fb7185" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Real" fill="#6366f1" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Pagado" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Estado de pagos</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pagado</span>
                  <span className="font-medium">{summary.paidPercentage}%</span>
                </div>
                <Progress value={summary.paidPercentage} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Planificados</p>
                  <p className="text-2xl font-bold">{summary.byStatus.planned}</p>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Confirmados</p>
                  <p className="text-2xl font-bold">{summary.byStatus.confirmed}</p>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Pagados</p>
                  <p className="text-2xl font-bold">{summary.byStatus.paid}</p>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Cancelados</p>
                  <p className="text-2xl font-bold">{summary.byStatus.cancelled}</p>
                </div>
              </div>

              <div className="rounded-3xl border bg-gradient-to-r from-primary/10 via-muted/30 to-primary/5 p-5">
                <p className="font-medium">Pendiente de pago</p>
                <p className="mt-2 text-3xl font-bold">
                  {formatCurrency(summary.pendingPayment)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gastos registrados</CardTitle>
            </CardHeader>

            <CardContent>
              {budget.items.length === 0 ? (
                <div className="rounded-2xl border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  Todavía no hay gastos registrados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-3 pr-4 font-medium">Gasto</th>
                        <th className="py-3 pr-4 font-medium">Categoría</th>
                        <th className="py-3 pr-4 font-medium">Estimado</th>
                        <th className="py-3 pr-4 font-medium">Real</th>
                        <th className="py-3 pr-4 font-medium">Pagado</th>
                        <th className="py-3 pr-4 font-medium">Estado</th>
                        <th className="py-3 pr-4 font-medium">Fecha</th>
                        <th className="py-3 pr-4 font-medium">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {budget.items.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-4 pr-4">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.supplier ?? "Sin proveedor"}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 pr-4">
                            {categoryLabels[item.category]}
                          </td>

                          <td className="py-4 pr-4">
                            {formatCurrency(item.estimatedAmount)}
                          </td>

                          <td className="py-4 pr-4">
                            {formatCurrency(item.actualAmount ?? item.estimatedAmount)}
                          </td>

                          <td className="py-4 pr-4">
                            {formatCurrency(item.paidAmount)}
                          </td>

                          <td className="py-4 pr-4">
                            <span className="rounded-full border bg-muted/40 px-3 py-1 text-xs">
                              {statusLabels[item.status]}
                            </span>
                          </td>

                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarDays className="h-4 w-4" />
                              {formatDate(item.dueDate)}
                            </div>
                          </td>

                          <td className="py-4 pr-4">
                            <div className="flex gap-2">
                              {item.status !== "PAID" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isSaving}
                                  onClick={() => markAsPaid(item)}
                                  className="rounded-xl"
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Pagar
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isSaving}
                                onClick={() => handleDeleteItem(item.id)}
                                className="rounded-xl"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}