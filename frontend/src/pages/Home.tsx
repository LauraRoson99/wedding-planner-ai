import { useEffect, useState } from "react"

import { Link } from "react-router"
import {
  AlertTriangle, ArrowRight, CalendarDays, CheckCircle2,
  Euro, Handshake, Send, ListCheck, Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getDashboardSummary } from "@/services/dashboardService"
import type { DashboardSummary } from "@/services/dashboardService"
import { getWeddingId } from "@/lib/auth"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
}

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "text-red-600 bg-red-50 border-red-200",
  MEDIUM: "text-yellow-700 bg-yellow-50 border-yellow-200",
  LOW: "text-green-700 bg-green-50 border-green-200",
}

const PRIORITY_LABEL: Record<string, string> = { HIGH: "Alta", MEDIUM: "Media", LOW: "Baja" }

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const weddingId = getWeddingId() ?? ""

  useEffect(() => {
    if (!weddingId) { setError("No se ha encontrado ninguna boda."); setIsLoading(false); return }
    getDashboardSummary(weddingId)
      .then(setDashboard)
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setIsLoading(false))
  }, [weddingId])

  const d = dashboard

  return (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-rose-50 via-background to-pink-50 p-6 shadow-sm dark:from-rose-950/20 dark:via-background dark:to-pink-950/20 md:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-700/20" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-pink-200/50 blur-3xl dark:bg-pink-700/20" />
          <div className="relative space-y-3">
            <div className="inline-flex rounded-full border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
              💍 Planifica2 · Tu boda bajo control
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Panel de planificación
            </h1>
            <p className="max-w-2xl text-muted-foreground md:text-lg">
              Aquí tienes el estado actual de tu boda: invitaciones, proveedores, tareas y presupuesto de un vistazo.
            </p>
          </div>
        </section>

        {error && (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {/* 4 tarjetas de progreso */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* Invitaciones */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-col gap-3 p-5 flex-1">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-muted p-2.5"><Send className="h-5 w-5" /></div>
                <Link to="/guests" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Ver <ArrowRight className="size-3" />
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invitaciones</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "—" : `${d?.invitations.sent ?? 0} / ${d?.invitations.total ?? 0}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isLoading ? "" : `${d?.invitations.pending ?? 0} pendientes de enviar`}
                </p>
              </div>
              <Progress value={isLoading ? 0 : (d?.invitations.percentage ?? 0)} className="h-2" />
              <p className="text-xs text-muted-foreground">{isLoading ? "" : `${d?.invitations.percentage ?? 0}% enviadas`}</p>
            </CardContent>
          </Card>

          {/* Proveedores */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-col gap-3 p-5 flex-1">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-muted p-2.5"><Handshake className="h-5 w-5" /></div>
                <Link to="/providers" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Ver <ArrowRight className="size-3" />
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proveedores</p>
                <p className="text-2xl font-bold">{isLoading ? "—" : d?.providers.total ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isLoading ? "" : `${d?.providers.confirmed ?? 0} confirmados`}
                </p>
              </div>
              {!isLoading && (d?.providers.needsAttention ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs text-yellow-700">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {d!.providers.needsAttention} en estado "Contactado" sin avanzar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tareas */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-col gap-3 p-5 flex-1">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-muted p-2.5"><ListCheck className="h-5 w-5" /></div>
                <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Ver <ArrowRight className="size-3" />
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tareas</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "—" : `${d?.tasks.completionPercentage ?? 0}%`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isLoading ? "" : `${d?.tasks.completed ?? 0} de ${d?.tasks.total ?? 0} completadas`}
                </p>
              </div>
              <Progress value={isLoading ? 0 : (d?.tasks.completionPercentage ?? 0)} className="h-2" />
              {!isLoading && (d?.overdueTasks ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {d!.overdueTasks} tarea{d!.overdueTasks > 1 ? "s" : ""} vencida{d!.overdueTasks > 1 ? "s" : ""}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Presupuesto */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-col gap-3 p-5 flex-1">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-muted p-2.5"><Euro className="h-5 w-5" /></div>
                <Link to="/budget" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Ver <ArrowRight className="size-3" />
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Presupuesto</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "—" : formatCurrency(d?.budget.actualTotal ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isLoading ? "" : d?.budget.totalBudget
                    ? `de ${formatCurrency(d.budget.totalBudget)} presupuestados`
                    : "presupuesto sin configurar"}
                </p>
              </div>
              {!isLoading && (() => {
                const budget = d?.budget
                const total = budget?.totalBudget ?? 0
                if (!budget || total <= 0) return null
                const pct = Math.min(Math.round((budget.actualTotal / total) * 100), 100)
                return (
                  <>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(budget.pendingTotal)} pendiente de pago
                    </p>
                  </>
                )
              })()}
            </CardContent>
          </Card>
        </section>

        {/* Sección central: tareas próximas + invitados */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* Próximas tareas con fecha */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Próximas tareas con fecha</CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link to="/tasks">Ver todas <ArrowRight className="size-3 ml-1" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : (d?.upcomingTasks.length ?? 0) === 0 ? (
                <div className="rounded-2xl border bg-muted/20 p-5 text-center text-sm text-muted-foreground">
                  No hay tareas con fecha próxima.
                  <br />
                  <Link to="/tasks" className="text-primary hover:underline">Añadir tareas con fecha límite →</Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {d!.upcomingTasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{task.title}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3.5" />
                          {formatDate(task.dueDate)}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLOR[task.priority]}`}>
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Resumen invitados + evento próximo */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Invitados</CardTitle>
                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link to="/guests">Ver todos <ArrowRight className="size-3 ml-1" /></Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Confirmados", value: d?.guests.confirmed ?? 0, icon: CheckCircle2, color: "text-green-600" },
                    { label: "Pendientes", value: d?.guests.pending ?? 0, icon: Users, color: "text-yellow-600" },
                    { label: "No vienen", value: d?.guests.declined ?? 0, icon: Users, color: "text-red-500" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-2xl border bg-muted/20 p-3 text-center">
                      <Icon className={`mx-auto mb-1 size-4 ${color}`} />
                      <p className="text-lg font-bold">{isLoading ? "—" : value}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Próximo evento</CardTitle>
                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link to="/agenda">Agenda <ArrowRight className="size-3 ml-1" /></Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">Cargando...</div>
                ) : d?.events.nextEvent ? (
                  <div className="rounded-2xl border bg-muted/20 p-4 space-y-1">
                    <p className="font-medium">{d.events.nextEvent.title}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="size-4" />
                      {formatDate(d.events.nextEvent.date)}
                      {d.events.nextEvent.time && ` · ${d.events.nextEvent.time}`}
                    </div>
                    {d.events.nextEvent.location && (
                      <p className="text-xs text-muted-foreground">{d.events.nextEvent.location}</p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border bg-muted/20 p-5 text-center text-sm text-muted-foreground">
                    No hay eventos próximos.
                    <br />
                    <Link to="/agenda" className="text-primary hover:underline">Añadir un evento →</Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Acciones rápidas */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Acceso rápido</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Invitados", href: "/guests", icon: Users },
              { label: "Tareas", href: "/tasks", icon: ListCheck },
              { label: "Agenda", href: "/agenda", icon: CalendarDays },
              { label: "Proveedores", href: "/providers", icon: Handshake },
              { label: "Presupuesto", href: "/budget", icon: Euro },
            ].map(({ label, href, icon: Icon }) => (
              <Button key={href} asChild variant="outline" className="h-12 rounded-2xl justify-start gap-2">
                <Link to={href}>
                  <Icon className="size-4" /> {label}
                </Link>
              </Button>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
