import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center bg-background text-foreground">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Bienvenidos a Planifica2</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground text-lg">
            Tu asistente inteligente para organizar la boda perfecta 💍
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button variant="default" size="lg">Ir a Tareas</Button>
            <Button variant="secondary" size="lg">Ver Presupuesto</Button>
            <Button variant="outline" size="lg">Abrir Agenda</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
