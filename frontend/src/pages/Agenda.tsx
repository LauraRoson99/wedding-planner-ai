import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { getWeddingId } from "@/lib/auth";
import type { TaskDto, TaskStatus } from "@/features/tasks/types";
import type { EventDto } from "@/features/events/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CalendarItemType = "task" | "event";

type SelectedCalendarItem =
  | {
      type: "task";
      task: TaskDto;
    }
  | {
      type: "event";
      event: EventDto;
    };

function toInputDate(value: string | null) {
  if (!value) return "";

  return value.slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";

  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isOverdue(task: TaskDto) {
  if (!task.dueDate || task.status === "COMPLETED") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

function getTaskColor(task: TaskDto) {
  if (isOverdue(task)) {
    return {
      backgroundColor: "#fee2e2",
      borderColor: "#fecaca",
      textColor: "#991b1b",
    };
  }

  if (task.status === "COMPLETED") {
    return {
      backgroundColor: "#dcfce7",
      borderColor: "#bbf7d0",
      textColor: "#166534",
    };
  }

  if (task.status === "IN_PROGRESS") {
    return {
      backgroundColor: "#dbeafe",
      borderColor: "#bfdbfe",
      textColor: "#1d4ed8",
    };
  }

  if (task.status === "BLOCKED") {
    return {
      backgroundColor: "#f3e8ff",
      borderColor: "#e9d5ff",
      textColor: "#7e22ce",
    };
  }

  return {
    backgroundColor: "#ffe4e6",
    borderColor: "#fecdd3",
    textColor: "#be123c",
  };
}

function statusLabel(status: TaskStatus) {
  if (status === "IN_PROGRESS") return "En progreso";
  if (status === "COMPLETED") return "Completada";
  if (status === "BLOCKED") return "Bloqueada";
  return "Pendiente";
}

export default function Agenda() {
  const weddingId = getWeddingId();

  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [events, setEvents] = useState<EventDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<SelectedCalendarItem | null>(
    null
  );

  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);

  const calendarRef = useRef<FullCalendar | null>(null);

  useEffect(() => {
    if (!weddingId) {
      setLoading(false);
      setError("No se encontró la boda activa");
      return;
    }

    loadAgendaData();
  }, [weddingId]);

  async function loadAgendaData() {
    if (!weddingId) return;

    try {
      setLoading(true);
      setError(null);

      const [tasksData, eventsData] = await Promise.all([
        apiGet<TaskDto[]>(`/tasks?weddingId=${weddingId}`),
        apiGet<EventDto[]>(`/events?weddingId=${weddingId}`),
      ]);

      setTasks(tasksData);
      setEvents(eventsData);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la agenda");
    } finally {
      setLoading(false);
    }
  }

  function resetEventForm() {
    setEditingEvent(null);
    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setEventDescription("");
  }

  function openCreateEventDialog(date?: string) {
    resetEventForm();
    setEventDate(date ?? new Date().toISOString().slice(0, 10));
    setEventDialogOpen(true);
  }

  function openEditEventDialog(event: EventDto) {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDate(toInputDate(event.date));
    setEventTime(event.time ?? "");
    setEventLocation(event.location ?? "");
    setEventDescription(event.description ?? "");
    setEventDialogOpen(true);
  }

  function handleDateClick(arg: DateClickArg) {
    openCreateEventDialog(arg.dateStr);
  }

  function handleEventClick(info: EventClickArg) {
    const itemType = info.event.extendedProps.type as CalendarItemType;

    if (itemType === "task") {
      const task = info.event.extendedProps.task as TaskDto;
      setSelectedItem({ type: "task", task });
      setDetailDialogOpen(true);
      return;
    }

    const event = info.event.extendedProps.event as EventDto;
    setSelectedItem({ type: "event", event });
    setDetailDialogOpen(true);
  }

  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();

    if (!eventTitle.trim()) {
      setError("El título del evento es obligatorio");
      return;
    }

    if (!eventDate) {
      setError("La fecha del evento es obligatoria");
      return;
    }

    if (!weddingId) {
      setError("No se encontró la boda activa");
      return;
    }

    try {
      setSavingEvent(true);
      setError(null);

      const payload = {
        title: eventTitle.trim(),
        date: eventDate,
        time: eventTime || null,
        location: eventLocation.trim() || null,
        description: eventDescription.trim() || null,
      };

      if (editingEvent) {
        const updatedEvent = await apiPut<EventDto>(
          `/events/${editingEvent.id}`,
          payload
        );

        setEvents((prev) =>
          prev.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
      } else {
        const newEvent = await apiPost<EventDto>("/events", {
          ...payload,
          weddingId,
        });

        setEvents((prev) => [...prev, newEvent]);
      }

      resetEventForm();
      setEventDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "No se pudo guardar el evento");
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleDeleteEvent(id: string) {
    try {
      setError(null);

      await apiDelete(`/events/${id}`);

      setEvents((prev) => prev.filter((event) => event.id !== id));
      setDetailDialogOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el evento");
    }
  }

  const calendarEvents = useMemo<EventInput[]>(() => {
    const taskCalendarEvents: EventInput[] = tasks
      .filter((task) => task.dueDate)
      .map((task) => {
        const colors = getTaskColor(task);

        return {
          id: `task-${task.id}`,
          title: `Tarea: ${task.title}`,
          start: toInputDate(task.dueDate),
          allDay: true,
          ...colors,
          extendedProps: {
            type: "task",
            task,
          },
        };
      });

    const realCalendarEvents: EventInput[] = events.map((event) => ({
      id: `event-${event.id}`,
      title: event.time ? `${event.time} · ${event.title}` : event.title,
      start: toInputDate(event.date),
      allDay: !event.time,
      backgroundColor: "#ede9fe",
      borderColor: "#ddd6fe",
      textColor: "#6d28d9",
      extendedProps: {
        type: "event",
        event,
      },
    }));

    return [...taskCalendarEvents, ...realCalendarEvents];
  }, [tasks, events]);

  const metrics = useMemo(() => {
    const tasksWithDueDate = tasks.filter((task) => task.dueDate).length;
    const overdueTasks = tasks.filter((task) => isOverdue(task)).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextSevenDays = new Date(today);
    nextSevenDays.setDate(today.getDate() + 7);

    const nextSevenDaysItems = [
      ...tasks.filter((task) => {
        if (!task.dueDate) return false;
        const date = new Date(task.dueDate);
        return date >= today && date <= nextSevenDays;
      }),
      ...events.filter((event) => {
        const date = new Date(event.date);
        return date >= today && date <= nextSevenDays;
      }),
    ].length;

    return {
      events: events.length,
      tasksWithDueDate,
      overdueTasks,
      nextSevenDaysItems,
    };
  }, [tasks, events]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex flex-col gap-4 rounded-3xl border bg-gradient-to-br from-rose-50 via-white to-purple-50 p-6 shadow-sm dark:from-rose-950/20 dark:via-background dark:to-purple-950/20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-rose-500">Planificación</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Agenda de la boda
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Visualiza en un único calendario los eventos importantes y las
              fechas límite de tus tareas.
            </p>
          </div>

          <Button
            onClick={() => openCreateEventDialog()}
            className="h-11 rounded-xl bg-rose-500 text-white hover:bg-rose-600"
          >
            <Plus className="mr-2 size-4" />
            Nuevo evento
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            title="Eventos"
            value={metrics.events}
            description="Eventos creados"
            icon={<CalendarDays className="size-5" />}
          />

          <MetricCard
            title="Tareas con fecha"
            value={metrics.tasksWithDueDate}
            description="Deadlines visibles"
            icon={<Clock3 className="size-5" />}
          />

          <MetricCard
            title="Vencidas"
            value={metrics.overdueTasks}
            description="Tareas fuera de plazo"
            icon={<Trash2 className="size-5" />}
          />

          <MetricCard
            title="Próximos 7 días"
            value={metrics.nextSevenDaysItems}
            description="Eventos y tareas"
            icon={<CheckCircle2 className="size-5" />}
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <Card className="overflow-hidden rounded-3xl shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Calendario</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Haz click en un día para crear un evento. Haz click en un
                  elemento para ver sus detalles.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Input
                  type="month"
                  className="h-10 w-[170px] rounded-xl"
                  onChange={(e) => {
                    if (!e.target.value) return;

                    const selected = `${e.target.value}-01`;
                    calendarRef.current?.getApi().gotoDate(selected);
                  }}
                />

                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => calendarRef.current?.getApi().today()}
                >
                  Hoy
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" />
                Cargando agenda...
              </div>
            ) : (
              <div className="agenda-calendar">
                <FullCalendar
                  ref={calendarRef}
                  locales={[esLocale]}
                  locale="es"
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  buttonText={{
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                  }}
                  events={calendarEvents}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  height="auto"
                  firstDay={1}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="overflow-hidden rounded-3xl border-0 p-0 shadow-2xl sm:max-w-xl">
          <div className="border-b bg-gradient-to-br from-rose-50 via-white to-purple-50 px-6 py-6 dark:from-rose-950/20 dark:via-background dark:to-purple-950/20">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingEvent ? "Editar evento" : "Nuevo evento"}
              </DialogTitle>
              <DialogDescription>
                Añade una cita, reunión, pago o momento importante de la boda.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveEvent} className="space-y-4 px-6 py-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ej. Visita al catering"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hora opcional</label>
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lugar</label>
              <Input
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Ej. Finca, iglesia, proveedor..."
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Notas, detalles importantes, personas implicadas..."
                className="min-h-[110px] w-full resize-none rounded-2xl border bg-background px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <DialogFooter className="gap-2 border-t pt-5 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  resetEventForm();
                  setEventDialogOpen(false);
                }}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={savingEvent || !eventTitle.trim() || !eventDate}
                className="rounded-xl bg-rose-500 text-white hover:bg-rose-600"
              >
                {savingEvent && <Loader2 className="mr-2 size-4 animate-spin" />}
                {savingEvent
                  ? "Guardando..."
                  : editingEvent
                    ? "Guardar cambios"
                    : "Crear evento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          {selectedItem?.type === "task" && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.task.title}</DialogTitle>
                <DialogDescription>
                  Tarea de la boda · {statusLabel(selectedItem.task.status)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <InfoRow
                  icon={<CalendarDays className="size-4" />}
                  label="Fecha límite"
                  value={formatDate(selectedItem.task.dueDate)}
                />

                {selectedItem.task.notes && (
                  <p className="rounded-2xl bg-muted p-4 text-muted-foreground">
                    {selectedItem.task.notes}
                  </p>
                )}
              </div>
            </>
          )}

          {selectedItem?.type === "event" && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.event.title}</DialogTitle>
                <DialogDescription>Evento de la agenda</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <InfoRow
                  icon={<CalendarDays className="size-4" />}
                  label="Fecha"
                  value={formatDate(selectedItem.event.date)}
                />

                {selectedItem.event.time && (
                  <InfoRow
                    icon={<Clock3 className="size-4" />}
                    label="Hora"
                    value={selectedItem.event.time}
                  />
                )}

                {selectedItem.event.location && (
                  <InfoRow
                    icon={<MapPin className="size-4" />}
                    label="Lugar"
                    value={selectedItem.event.location}
                  />
                )}

                {selectedItem.event.description && (
                  <p className="rounded-2xl bg-muted p-4 text-muted-foreground">
                    {selectedItem.event.description}
                  </p>
                )}

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setDetailDialogOpen(false);
                      openEditEventDialog(selectedItem.event);
                    }}
                  >
                    Editar
                  </Button>

                  <Button
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => handleDeleteEvent(selectedItem.event.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
};

function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/40">
          {icon}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/40">
        {icon}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}