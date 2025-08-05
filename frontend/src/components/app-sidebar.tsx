import { NavLink } from 'react-router-dom'
import { Home, ListCheck, Calendar, Wallet, UsersRound } from 'lucide-react'

const navItems = [
  { to: "/", icon: <Home className="size-5" />, label: "Inicio" },
  { to: "/tasks", icon: <ListCheck className="size-5" />, label: "Tareas" },
  { to: "/guests", icon: <UsersRound className="size-5" />, label: "Invitados" },
  { to: "/agenda", icon: <Calendar className="size-5" />, label: "Agenda" },
  { to: "/budget", icon: <Wallet className="size-5" />, label: "Presupuesto" },
]

export function AppSidebar() {
  return (
    <aside className="w-48 pr-4 pt-8 space-y-4 text-sm">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
