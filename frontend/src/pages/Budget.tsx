import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus } from "lucide-react"
import { DonutChart } from "@/components/budgets/DonutChart"
import { BarChart } from "@/components/budgets/BarChart"

export default function Budget() {
  const [budget, setBudget] = useState(20000)
  const [expenses, setExpenses] = useState([
    { id: 1, name: "Banquete", amount: 5000 },
    { id: 2, name: "Vestido", amount: 1200 },
    { id: 3, name: "Fotografía", amount: 900 },
  ])

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const percentage = Math.min((totalSpent / budget) * 100, 100)

  return (
    <div className="p-6 space-y-6">
        {/* Tarjeta principal: Presupuesto general */}
        <Card className="bg-white shadow-md">
            <CardHeader>
            <CardTitle className="text-lg">Presupuesto total</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-bold">
            {totalSpent.toLocaleString()}€ / {budget.toLocaleString()}€
            <Progress value={percentage} />
            <div className="text-sm mt-2 text-muted-foreground">
                Has gastado el {percentage.toFixed(1)}% del presupuesto
            </div>
            </CardContent>
        </Card>

        {/* Lista de gastos por categoría */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Categorías</h3>
            <Button>
                <Plus className="w-4 h-4 mr-2" />
                Añadir gasto
            </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenses.map((item) => (
                <Card key={item.id} className="bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-lg font-semibold">
                    {item.amount.toLocaleString()}€
                </CardContent>
                </Card>
            ))}
            </div>
        </div>

        {/* Placeholder para gráfica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-sm">
                <CardHeader>
                <CardTitle className="text-lg">Distribución del presupuesto</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                <DonutChart />
                </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
                <CardHeader>
                <CardTitle className="text-lg">Gasto mensual</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                <BarChart />
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
