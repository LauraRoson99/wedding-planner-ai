import { useState } from "react"
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

type Task = {
    id: number
    title: string
    completed: boolean
}

const mockTasks: Task[] = [
    { id: 1, title: "Reservar el restaurante", completed: true },
    { id: 2, title: "Enviar invitaciones", completed: false },
    { id: 3, title: "Comprar el vestido", completed: false },
    { id: 4, title: "Contratar fotógrafo", completed: true },
]

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>(mockTasks)
    const [input, setInput] = useState("")
    const [tab, setTab] = useState("all")

    const filteredTasks = tasks.filter(task => {
        if (tab === "completed") return task.completed
        if (tab === "pending") return !task.completed
        return true
    })

    const handleAdd = () => {
        if (!input.trim()) return
        const newTask: Task = {
            id: Date.now(),
            title: input.trim(),
            completed: false,
        }
        setTasks(prev => [...prev, newTask])
        setInput("")
    }

    const toggleTask = (id: number) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        )
    }

    const deleteTask = (id: number) => {
        setTasks(prev => prev.filter(task => task.id !== id))
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
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                            <Button onClick={handleAdd}>Añadir</Button>
                        </div>

                        <Tabs value={tab} onValueChange={setTab} className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">Todas</TabsTrigger>
                                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                                <TabsTrigger value="completed">Completadas</TabsTrigger>
                            </TabsList>

                            <TabsContent value={tab}>
                                <ul className="space-y-2">
                                    {filteredTasks.length === 0 && (
                                        <p className="text-muted-foreground">No hay tareas.</p>
                                    )}
                                    {filteredTasks.map((task) => (
                                        <li
                                            key={task.id}
                                            className={`flex items-center justify-between p-3 rounded-md border bg-background transition-all ${task.completed ? "opacity-70" : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => toggleTask(task.id)}
                                                />
                                                <span
                                                    className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""
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
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
