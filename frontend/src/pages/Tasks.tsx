import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2 } from "lucide-react"
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api"
import type { TaskDto } from "@/features/tasks/types"
import { getWeddingId } from "@/lib/auth"

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskDto[]>([])
  const [input, setInput] = useState("")
  const [tab, setTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const weddingId = getWeddingId()

  useEffect(() => {
    if (!weddingId) {
      setTasks([])
      setLoading(false)
      setError("No se encontró la boda activa")
      return
    }

    loadTasks()
  }, [weddingId])

  async function loadTasks() {
    if (!weddingId) return

    try {
      setLoading(true)
      setError(null)

      const data = await apiGet<TaskDto[]>(`/tasks?weddingId=${weddingId}`)
      setTasks(data)
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar las tareas")
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (tab === "completed") return task.completed
    if (tab === "pending") return !task.completed
    return true
  })

  async function handleAdd() {
    const title = input.trim()

    if (!title) return

    if (!weddingId) {
      setError("No se encontró la boda activa")
      return
    }

    try {
      setCreating(true)
      setError(null)

      const newTask = await apiPost<TaskDto>("/tasks", {
        title,
        weddingId,
      })

      setTasks(prev => [...prev, newTask])
      setInput("")
    } catch (err) {
      console.error(err)
      setError("No se pudo crear la tarea")
    } finally {
      setCreating(false)
    }
  }

  async function toggleTask(id: string, completed: boolean) {
    try {
      setError(null)

      const updatedTask = await apiPut<TaskDto>(`/tasks/${id}`, {
        completed: !completed,
      })

      setTasks(prev =>
        prev.map(task =>
          task.id === id ? updatedTask : task
        )
      )
    } catch (err) {
      console.error(err)
      setError("No se pudo actualizar la tarea")
    }
  }

  async function deleteTask(id: string) {
    try {
      setError(null)

      await apiDelete(`/tasks/${id}`)
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (err) {
      console.error(err)
      setError("No se pudo eliminar la tarea")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tareas de la boda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Añadir nueva tarea..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !creating) {
                    handleAdd()
                  }
                }}
              />
              <Button onClick={handleAdd} disabled={creating || !input.trim() || !weddingId}>
                {creating ? "Añadiendo..." : "Añadir"}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="completed">Completadas</TabsTrigger>
              </TabsList>

              <TabsContent value={tab}>
                {loading ? (
                  <p className="text-muted-foreground">Cargando tareas...</p>
                ) : (
                  <ul className="space-y-2">
                    {filteredTasks.length === 0 && (
                      <p className="text-muted-foreground">No hay tareas.</p>
                    )}
                    {filteredTasks.map((task) => (
                      <li
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-md border bg-background transition-all ${
                          task.completed ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id, task.completed)}
                          />
                          <span
                            className={`text-sm ${
                              task.completed ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}