import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardSummary } from "@/services/dashboardService"
import type { DashboardSummary } from "@/services/dashboardService"
import { getWeddingId } from "@/lib/auth"

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const weddingId = getWeddingId() ?? "";

  useEffect(() => {
    async function loadDashboard() {
      if (!weddingId) {
        setError("No se ha encontrado ninguna boda seleccionada.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data = await getDashboardSummary(weddingId)
        setDashboard(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se ha podido cargar el resumen."
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [weddingId])

  const quickActions = [
    {
      title: "Organizar invitados",
      description: "Gestiona asistentes, grupos, mesas y preferencias especiales.",
      emoji: "👥",
      href: "/guests",
      button: "Ver invitados",
    },
    {
      title: "Planificar tareas",
      description: "Controla pendientes, prioridades, estados y fechas límite.",
      emoji: "✅",
      href: "/tasks",
      button: "Ir a tareas",
    },
    {
      title: "Abrir agenda",
      description: "Consulta eventos importantes, citas, pruebas y recordatorios.",
      emoji: "📅",
      href: "/agenda",
      button: "Ver agenda",
    },
    {
      title: "Controlar presupuesto",
      description: "Revisa gastos, proveedores, pagos pendientes y desviaciones.",
      emoji: "💸",
      href: "/budget",
      button: "Ver presupuesto",
    },
  ]

  const weddingSteps = [
    "Define la lista inicial de invitados.",
    "Organiza los grupos principales.",
    "Crea las primeras mesas.",
    "Añade tareas con fechas límite.",
    "Registra pagos y presupuesto estimado.",
  ]

  const stats = [
    {
      label: "Invitados",
      value: dashboard ? dashboard.guests.total.toString() : "—",
      detail: dashboard
        ? `${dashboard.guests.confirmed} confirmados · ${dashboard.guests.pending} pendientes`
        : "cargando invitados",
    },
    {
      label: "Tareas",
      value: dashboard ? `${dashboard.tasks.completionPercentage}%` : "—",
      detail: dashboard
        ? `${dashboard.tasks.completed} de ${dashboard.tasks.total} completadas`
        : "cargando tareas",
    },
    {
      label: "Presupuesto",
      value: dashboard?.budget.available
        ? `${dashboard.budget.estimatedTotal.toLocaleString("es-ES")} €`
        : "—",
      detail: dashboard?.budget.available
        ? "presupuesto estimado"
        : "pendiente de configurar",
    },
  ]

  const nextEventDate = dashboard?.events.nextEvent
    ? new Date(dashboard.events.nextEvent.date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 lg:py-12">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-rose-50 via-background to-pink-50 p-8 shadow-sm dark:from-rose-950/20 dark:via-background dark:to-pink-950/20 md:p-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-700/20" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-pink-200/50 blur-3xl dark:bg-pink-700/20" />

          <div className="relative grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
                💍 Planifica2 · Tu boda bajo control
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                  Organiza tu boda de forma clara, bonita e inteligente.
                </h1>

                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Centraliza invitados, mesas, tareas, agenda y presupuesto en una sola
                  plataforma visual, sencilla y pensada para reducir el caos de la
                  planificación.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link to="/guests">Empezar por invitados</Link>
                </Button>

                <Button asChild variant="secondary" size="lg" className="rounded-full px-6">
                  <Link to="/tasks">Ver tareas</Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                  <Link to="/agenda">Abrir agenda</Link>
                </Button>
              </div>
            </div>

            <Card className="relative border-0 bg-background/85 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">Resumen inicial</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {isLoading && (
                  <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Cargando resumen de la boda...
                  </div>
                )}

                {!isLoading && error && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {!isLoading &&
                  !error &&
                  stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-2xl border bg-muted/30 p-4"
                    >
                      <div>
                        <p className="font-medium">{stat.label}</p>
                        <p className="text-sm text-muted-foreground">{stat.detail}</p>
                      </div>

                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  ))}

                {!isLoading && !error && dashboard && (
                  <div className="rounded-2xl bg-rose-100/70 p-4 text-sm text-rose-950 dark:bg-rose-950/30 dark:text-rose-100">
                    {dashboard.organization.tables === 0
                      ? "Consejo: crea tus primeras mesas para empezar a visualizar la distribución."
                      : `Tienes ${dashboard.organization.assignedGuests} invitados sentados de ${dashboard.organization.totalSeats} plazas disponibles.`}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl transition-transform duration-300 group-hover:scale-110">
                  {action.emoji}
                </div>

                <CardTitle className="text-xl">{action.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  {action.description}
                </p>

                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link to={action.href}>{action.button}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Primeros pasos recomendados</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {weddingSteps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>

                    <div className="rounded-2xl border bg-muted/20 px-4 py-3 text-sm">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm">
            <CardHeader>
              <CardTitle>Centro de planificación</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-muted/20 p-5">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Organización visual
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboard
                      ? `${dashboard.organization.tables} mesas`
                      : "Mesas y grupos"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {dashboard
                      ? `${dashboard.organization.groups} grupos creados · ${dashboard.organization.tableOccupationPercentage}% de ocupación de mesas.`
                      : "Diseña la estructura de la boda sin perderte entre hojas de cálculo o notas sueltas."}
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-5">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Próximos eventos
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboard ? dashboard.events.upcoming : "—"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {dashboard?.events.nextEvent
                      ? `Próximo: ${dashboard.events.nextEvent.title} · ${nextEventDate}`
                      : "Todavía no hay próximos eventos registrados."}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border bg-gradient-to-r from-primary/10 via-muted/30 to-primary/5 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Próxima mejora sugerida</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Añadir una página de análisis con gráficos de invitados,
                      presupuesto, tareas completadas y evolución de la planificación.
                    </p>
                  </div>

                  <Button asChild className="rounded-full">
                    <Link to="/analysis">Ver análisis</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    </div>
  )
}