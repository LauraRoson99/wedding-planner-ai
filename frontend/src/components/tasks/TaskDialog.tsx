import { useEffect, useState } from "react";
import type {
  TaskCategory,
  TaskDto,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types";
import { apiPost, apiPut } from "@/lib/api";
import { getWeddingId } from "@/lib/auth";

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

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (task: TaskDto) => void;
  task?: TaskDto | null;
};

export default function TaskDialog({
  open,
  onOpenChange,
  onSaved,
  task,
}: TaskDialogProps) {
  const weddingId = getWeddingId();
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("PENDING");
  const [category, setCategory] = useState<TaskCategory>("OTHER");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? "");
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
      setPriority(task.priority ?? "MEDIUM");
      setStatus(task.status ?? "PENDING");
      setCategory(task.category ?? "OTHER");
      setNotes(task.notes ?? "");
      setError(null);
    } else {
      resetForm();
    }
  }, [task, open]);

  function resetForm() {
    setTitle("");
    setDueDate("");
    setPriority("MEDIUM");
    setStatus("PENDING");
    setCategory("OTHER");
    setNotes("");
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }

    if (!isEdit && !weddingId) {
      setError("No se encontró la boda activa");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEdit && task) {
        const updatedTask = await apiPut<TaskDto>(`/tasks/${task.id}`, {
          title: title.trim(),
          dueDate: dueDate || null,
          priority,
          status,
          category,
          notes: notes.trim() || null,
        });

        onSaved(updatedTask);
      } else {
        const newTask = await apiPost<TaskDto>("/tasks", {
          title: title.trim(),
          weddingId,
          dueDate: dueDate || null,
          priority,
          status,
          category,
          notes: notes.trim() || null,
        });

        onSaved(newTask);
      }

      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "No se pudo guardar la tarea");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica la información de la tarea."
              : "Añade una nueva tarea para la boda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <Input
              placeholder="Ej. Confirmar menú con el catering"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha límite</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridad</label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="PENDING">Pendiente</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="BLOCKED">Bloqueada</option>
                <option value="COMPLETED">Completada</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
              >
                <option value="GUESTS">Invitados</option>
                <option value="CEREMONY">Ceremonia</option>
                <option value="BANQUET">Banquete</option>
                <option value="DECORATION">Decoración</option>
                <option value="PHOTO_VIDEO">Foto y vídeo</option>
                <option value="MUSIC">Música</option>
                <option value="TRAVEL">Viaje</option>
                <option value="OUTFITS">Vestuario</option>
                <option value="PAPERWORK">Papeleo</option>
                <option value="BUDGET">Presupuesto</option>
                <option value="OTHER">Otros</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas</label>
            <textarea
              className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Detalles importantes, proveedor, recordatorios..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}