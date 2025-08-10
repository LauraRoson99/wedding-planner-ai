// src/components/BudgetChart.tsx
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

const data = {
  labels: ["Banquete", "Vestido", "Fotografía", "Decoración", "Música"],
  datasets: [
    {
      label: "Gasto (€)",
      data: [5000, 1200, 900, 700, 400],
      backgroundColor: [
        "#4f46e5", // Banquete
        "#ec4899", // Vestido
        "#f59e0b", // Fotografía
        "#10b981", // Decoración
        "#8b5cf6", // Música
      ],
      borderColor: "#fff",
      borderWidth: 2,
    },
  ],
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
}

export function DonutChart() {
  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-md">
      <h4 className="text-lg font-semibold mb-2 text-center">Distribución del Gasto</h4>
      <Doughnut data={data} options={options} />
    </div>
  )
}
