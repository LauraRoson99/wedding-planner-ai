import { useState, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

type Event = {
  id: string
  title: string
  date: string
}

export default function Agenda() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [showDialog, setShowDialog] = useState(false)

  const calendarRef = useRef<FullCalendar | null>(null)

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr)
    setShowDialog(true)
  }

  const handleAddEvent = () => {
    if (!newEventTitle || !selectedDate) return
    const newEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: selectedDate,
    }
    setEvents((prev) => [...prev, newEvent])
    setNewEventTitle("")
    setShowDialog(false)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="month"
          className="border rounded px-2 py-1 text-sm"
          onChange={(e) => {
            const selected = e.target.value + "-01"
            calendarRef.current?.getApi().gotoDate(selected)
          }}
        />

        <Button onClick={() => {
          setSelectedDate(new Date().toISOString().split("T")[0])
          setShowDialog(true)
        }}>
          <Plus className="w-4 h-4 mr-2" /> Añadir evento
        </Button>
      </div>

      <FullCalendar
        ref={calendarRef}
        locales={[esLocale]}
        locale="es"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={(info) => {
          if (confirm(`¿Eliminar el evento "${info.event.title}"?`)) {
            handleDeleteEvent(info.event.id)
          }
        }}
        height="auto"
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Título del evento"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <Input
              type="date"
              value={selectedDate ?? ""}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Button onClick={handleAddEvent} className="w-full">
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
