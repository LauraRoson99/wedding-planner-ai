import { Outlet } from 'react-router-dom'
import { AppHeader } from './app-header'
import { AppFooter } from './app-footer'
import { AppSidebar } from './app-sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <AppHeader />

      <div className="flex flex-grow w-full ps-2 md:ps-4">
        <AppSidebar />

        <main className="flex-grow">
          <Outlet />
        </main>
      </div>

      <AppFooter />
    </div>
  )
}
