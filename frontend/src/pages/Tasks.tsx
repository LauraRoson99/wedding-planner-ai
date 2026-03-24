import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { apiDelete, apiGet, apiPut } from "@/lib/api";
import type {
  TaskCategory,
  TaskDto,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types";
import { getWeddingId } from "@/lib/auth";
import TaskDialog from "@/components/tasks/TaskDialog";

type SortOption =
  | "dueDateAsc"
  | "priorityDesc"
  | "newest"
  | "oldest";

type MultiFilterDropdownProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (values: T[]) => void;
};

function MultiFilterDropdown<T extends string>({
  label,
  options,
  selected,
  onChange,
}: MultiFilterDropdownProps<T>) {
  function toggleValue(value: T, checked: boolean) {
    if (checked) {
      if (!selected.includes(value)) {
        onChange([...selected, value]);
      }
    } else {
      onChange(selected.filter((item) => item !== value));
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between">
          <span>{label}</span>
          <span className="text-muted-foreground text-xs">
            {selected.length > 0 ? `${selected.length} seleccionado(s)` : "Todas"}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={(checked) => toggleValue(option.value, checked === true)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>([]);
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("dueDateAsc");

  const weddingId = getWeddingId();

  useEffect(() => {
    if (!weddingId) {
      setTasks([]);
      setLoading(false);
      setError("No se encontró la boda activa");
      return;
    }

    loadTasks();
  }, [weddingId]);

  async function loadTasks() {
    if (!weddingId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await apiGet<TaskDto[]>(`/tasks?weddingId=${weddingId}`);
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las tareas");
    } finally {
      setLoading(false);
    }
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    try {
      setError(null);

      const updatedTask = await apiPut<TaskDto>(`/tasks/${id}`, { status });

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la tarea");
    }
  }

  async function toggleTask(id: string, completed: boolean) {
    const nextStatus: TaskStatus = completed ? "PENDING" : "COMPLETED";
    await updateTaskStatus(id, nextStatus);
  }

  async function deleteTask(id: string) {
    try {
      setError(null);

      await apiDelete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la tarea");
    }
  }

  function openCreateDialog() {
    setSelectedTask(null);
    setDialogOpen(true);
  }

  function openEditDialog(task: TaskDto) {
    setSelectedTask(task);
    setDialogOpen(true);
  }

  function formatDate(date: string | null) {
    if (!date) return "Sin fecha";
    return new Date(date).toLocaleDateString("es-ES");
  }

  function isOverdue(task: TaskDto) {
    if (!task.dueDate || task.status === "COMPLETED") return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
  }

  function priorityWeight(priority: TaskPriority) {
    if (priority === "HIGH") return 3;
    if (priority === "MEDIUM") return 2;
    return 1;
  }

  const visibleTasks = useMemo(() => {
    let result = [...tasks];

    if (tab === "PENDING") {
      result = result.filter((task) => task.status === "PENDING");
    } else if (tab === "IN_PROGRESS") {
      result = result.filter((task) => task.status === "IN_PROGRESS");
    } else if (tab === "BLOCKED") {
      result = result.filter((task) => task.status === "BLOCKED");
    } else if (tab === "COMPLETED") {
      result = result.filter((task) => task.status === "COMPLETED");
    }

    if (priorityFilter.length > 0) {
      result = result.filter((task) => priorityFilter.includes(task.priority));
    }

    if (statusFilter.length > 0) {
      result = result.filter((task) => statusFilter.includes(task.status));
    }

    if (categoryFilter.length > 0) {
      result = result.filter((task) => categoryFilter.includes(task.category));
    }

    result.sort((a, b) => {
      if (sortBy === "priorityDesc") {
        return priorityWeight(b.priority) - priorityWeight(a.priority);
      }

      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });

    return result;
  }, [tasks, tab, priorityFilter, statusFilter, categoryFilter, sortBy]);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const blocked = tasks.filter((t) => t.status === "BLOCKED").length;
    const overdue = tasks.filter((t) => isOverdue(t)).length;
    const pending = tasks.filter((t) => t.status === "PENDING").length;

    return { total, completed, inProgress, blocked, overdue, pending };
  }, [tasks]);

  function getPriorityChipClass(priority: TaskPriority) {
    if (priority === "HIGH") {
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900";
    }
    if (priority === "LOW") {
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800";
    }
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900";
  }

  function getStatusChipClass(status: TaskStatus) {
    if (status === "COMPLETED") {
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900";
    }
    if (status === "IN_PROGRESS") {
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900";
    }
    if (status === "BLOCKED") {
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900";
    }
    return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800";
  }

  function getCategoryChipClass() {
    return "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-900";
  }

  function priorityLabel(priority: TaskPriority) {
    if (priority === "HIGH") return "Alta";
    if (priority === "LOW") return "Baja";
    return "Media";
  }

  function statusLabel(status: TaskStatus) {
    if (status === "IN_PROGRESS") return "En progreso";
    if (status === "COMPLETED") return "Completada";
    if (status === "BLOCKED") return "Bloqueada";
    return "Pendiente";
  }

  function categoryLabel(category: TaskCategory) {
    switch (category) {
      case "GUESTS":
        return "Invitados";
      case "CEREMONY":
        return "Ceremonia";
      case "BANQUET":
        return "Banquete";
      case "DECORATION":
        return "Decoración";
      case "PHOTO_VIDEO":
        return "Foto y vídeo";
      case "MUSIC":
        return "Música";
      case "TRAVEL":
        return "Viaje";
      case "OUTFITS":
        return "Vestuario";
      case "PAPERWORK":
        return "Papeleo";
      case "BUDGET":
        return "Presupuesto";
      default:
        return "Otros";
    }
  }

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: "HIGH", label: "Alta" },
    { value: "MEDIUM", label: "Media" },
    { value: "LOW", label: "Baja" },
  ];

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: "PENDING", label: "Pendiente" },
    { value: "IN_PROGRESS", label: "En progreso" },
    { value: "BLOCKED", label: "Bloqueada" },
    { value: "COMPLETED", label: "Completada" },
  ];

  const categoryOptions: { value: TaskCategory; label: string }[] = [
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl">Tareas de la boda</CardTitle>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="size-4" />
              Nueva tarea
            </Button>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Totales</p>
              <p className="text-2xl font-semibold">{metrics.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-semibold">{metrics.pending}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">En progreso</p>
              <p className="text-2xl font-semibold">{metrics.inProgress}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Bloqueadas</p>
              <p className="text-2xl font-semibold">{metrics.blocked}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Vencidas</p>
              <p className="text-2xl font-semibold">{metrics.overdue}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-semibold">{metrics.completed}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="mb-4 flex flex-wrap h-auto">
                <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
                <TabsTrigger value="PENDING">
                  Pendientes ({tasks.filter((t) => t.status === "PENDING").length})
                </TabsTrigger>
                <TabsTrigger value="IN_PROGRESS">
                  En progreso ({tasks.filter((t) => t.status === "IN_PROGRESS").length})
                </TabsTrigger>
                <TabsTrigger value="BLOCKED">
                  Bloqueadas ({tasks.filter((t) => t.status === "BLOCKED").length})
                </TabsTrigger>
                <TabsTrigger value="COMPLETED">
                  Completadas ({tasks.filter((t) => t.status === "COMPLETED").length})
                </TabsTrigger>
              </TabsList>

              <div className="grid gap-3 mb-4 md:grid-cols-2 xl:grid-cols-4">
                <MultiFilterDropdown
                  label="Prioridad"
                  options={priorityOptions}
                  selected={priorityFilter}
                  onChange={setPriorityFilter}
                />

                <MultiFilterDropdown
                  label="Estado"
                  options={statusOptions}
                  selected={statusFilter}
                  onChange={setStatusFilter}
                />

                <MultiFilterDropdown
                  label="Categoría"
                  options={categoryOptions}
                  selected={categoryFilter}
                  onChange={setCategoryFilter}
                />

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDateAsc">Fecha más próxima</SelectItem>
                    <SelectItem value="priorityDesc">Prioridad alta primero</SelectItem>
                    <SelectItem value="newest">Más recientes</SelectItem>
                    <SelectItem value="oldest">Más antiguas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(priorityFilter.length > 0 ||
                statusFilter.length > 0 ||
                categoryFilter.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {priorityFilter.map((value) => (
                    <Badge key={value} variant="secondary" className="gap-1">
                      Prioridad: {priorityLabel(value)}
                      <button
                        type="button"
                        onClick={() =>
                          setPriorityFilter((prev) => prev.filter((v) => v !== value))
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}

                  {statusFilter.map((value) => (
                    <Badge key={value} variant="secondary" className="gap-1">
                      Estado: {statusLabel(value)}
                      <button
                        type="button"
                        onClick={() =>
                          setStatusFilter((prev) => prev.filter((v) => v !== value))
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}

                  {categoryFilter.map((value) => (
                    <Badge key={value} variant="secondary" className="gap-1">
                      Categoría: {categoryLabel(value)}
                      <button
                        type="button"
                        onClick={() =>
                          setCategoryFilter((prev) => prev.filter((v) => v !== value))
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPriorityFilter([]);
                      setStatusFilter([]);
                      setCategoryFilter([]);
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}

              <TabsContent value={tab}>
                {loading ? (
                  <p className="text-muted-foreground">Cargando tareas...</p>
                ) : (
                  <ul className="space-y-3">
                    {visibleTasks.length === 0 && (
                      <p className="text-muted-foreground">No hay tareas.</p>
                    )}

                    {visibleTasks.map((task) => {
                      const overdue = isOverdue(task);

                      return (
                        <li
                          key={task.id}
                          className={`rounded-xl border p-4 transition-all ${
                            task.status === "COMPLETED" ? "opacity-70" : ""
                          } ${
                            overdue
                              ? "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                              : "bg-background"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id, task.completed)}
                                className="mt-1"
                              />

                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p
                                    className={`font-medium ${
                                      task.completed
                                        ? "line-through text-muted-foreground"
                                        : ""
                                    }`}
                                  >
                                    {task.title}
                                  </p>

                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${getPriorityChipClass(task.priority)}`}
                                  >
                                    Prioridad {priorityLabel(task.priority)}
                                  </span>

                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusChipClass(task.status)}`}
                                  >
                                    {statusLabel(task.status)}
                                  </span>

                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${getCategoryChipClass()}`}
                                  >
                                    {categoryLabel(task.category)}
                                  </span>

                                  {overdue && (
                                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                                      Vencida
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  <span>Fecha: {formatDate(task.dueDate)}</span>
                                </div>

                                {task.notes && (
                                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                                    {task.notes}
                                  </p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateTaskStatus(task.id, "PENDING")}
                                  >
                                    Pendiente
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
                                  >
                                    En progreso
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateTaskStatus(task.id, "BLOCKED")}
                                  >
                                    Bloqueada
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateTaskStatus(task.id, "COMPLETED")}
                                  >
                                    Completar
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(task)}
                              >
                                <Pencil className="size-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        onSaved={(savedTask) => {
          setTasks((prev) => {
            const exists = prev.some((task) => task.id === savedTask.id);

            if (exists) {
              return prev.map((task) =>
                task.id === savedTask.id ? savedTask : task
              );
            }

            return [...prev, savedTask];
          });
        }}
      />
    </div>
  );
}