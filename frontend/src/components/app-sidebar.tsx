import { NavLink } from 'react-router-dom'
import { mainMenu } from '@/config/menu'

export function AppSidebar() {
  return (
    <aside className="w-48 pr-4 pt-8 space-y-4 text-sm">
      <nav className="space-y-2">
        {mainMenu.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {Icon && <Icon className="size-5" />}
              {item.title}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
