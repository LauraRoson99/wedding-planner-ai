// src/components/budgets/BudgetBarChart.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export function BarChart() {
  const data = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"],
    datasets: [
      {
        label: "Gasto mensual (€)",
        data: [3000, 2000, 1500, 2500, 1000, 1200, 1800, 0],
        backgroundColor: "#4f46e5",
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
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 500,
        },
      },
    },
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Bar data={data} options={options} />
    </div>
  )
}
