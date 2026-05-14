import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Clock3,
  FileText,
  Flag,
  Folder,
  Loader2,
  PencilLine,
  Sparkles,
} from "lucide-react";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (task: TaskDto) => void;
  task?: TaskDto | null;
};

const priorityOptions: {
  value: TaskPriority;
  label: string;
}[] = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
];

const statusOptions: {
  value: TaskStatus;
  label: string;
  icon: typeof CircleDashed;
}[] = [
  { value: "PENDING", label: "Pendiente", icon: CircleDashed },
  { value: "IN_PROGRESS", label: "En progreso", icon: Clock3 },
  { value: "BLOCKED", label: "Bloqueada", icon: CircleAlert },
  { value: "COMPLETED", label: "Completada", icon: CheckCircle2 },
];

const categoryOptions: {
  value: TaskCategory;
  label: string;
}[] = [
  { value: "GUESTS", label: "Invitados" },
  { value: "CEREMONY", label: "Ceremonia" },
  { value: "BANQUET", label: "Banquete" },
  { value: "DECORATION", label: "Decoración" },
  { value: "PHOTO_VIDEO", label: "Foto y vídeo" },
  { value: "MUSIC", label: "Música" },
  { value: "TRAVEL", label: "Viaje" },
  { value: "OUTFITS", label: "Vestuario" },
  { value: "PAPERWORK", label: "Papeleo" },
  { value: "BUDGET", label: "Presupuesto" },
  { value: "OTHER", label: "Otros" },
];

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

      const payload = {
        title: title.trim(),
        dueDate: dueDate || null,
        priority,
        status,
        category,
        notes: notes.trim() || null,
      };

      if (isEdit && task) {
        const updatedTask = await apiPut<TaskDto>(`/tasks/${task.id}`, payload);
        onSaved(updatedTask);
      } else {
        const newTask = await apiPost<TaskDto>("/tasks", {
          ...payload,
          weddingId,
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
      <DialogContent className="overflow-hidden rounded-3xl border-0 p-0 shadow-2xl sm:max-w-2xl">
        <div className="border-b bg-gradient-to-br from-rose-50 via-white to-purple-50 px-6 py-6 dark:from-rose-950/20 dark:via-background dark:to-purple-950/20">
          <DialogHeader className="space-y-4">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-border dark:bg-background">
              {isEdit ? (
                <PencilLine className="size-5 text-rose-500" />
              ) : (
                <Sparkles className="size-5 text-rose-500" />
              )}
            </div>

            <div>
              <DialogTitle className="text-2xl font-semibold">
                {isEdit ? "Editar tarea" : "Nueva tarea"}
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm">
                {isEdit
                  ? "Modifica la información de la tarea."
                  : "Añade una nueva tarea y clasifícala para tener la boda bajo control."}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>

            <div className="relative">
              <FileText className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Ej. Confirmar menú con el catering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-xl pl-9 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Fecha límite" icon={<CalendarDays className="size-4" />}>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11 rounded-xl border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </FormField>

            <FormField label="Prioridad" icon={<Flag className="size-4" />}>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Selecciona prioridad" />
                </SelectTrigger>

                <SelectContent className="rounded-2xl">
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Estado" icon={<Clock3 className="size-4" />}>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as TaskStatus)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>

                <SelectContent className="rounded-2xl">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;

                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 text-muted-foreground" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Categoría" icon={<Folder className="size-4" />}>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as TaskCategory)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>

                <SelectContent className="max-h-72 rounded-2xl">
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas</label>

            <textarea
              className="min-h-[120px] w-full resize-none rounded-2xl border bg-background px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:focus:border-rose-800 dark:focus:ring-rose-950"
              placeholder="Detalles importantes, proveedor, recordatorios..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 border-t pt-5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={saving || !title.trim()}
              className="rounded-xl bg-rose-500 text-white hover:bg-rose-600"
            >
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type FormFieldProps = {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

function FormField({ label, icon, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <div className="flex h-14 items-center gap-3 rounded-2xl border bg-background px-4 shadow-sm transition-colors focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 dark:focus-within:border-rose-800 dark:focus-within:ring-rose-950">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/40">
          {icon}
        </div>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}