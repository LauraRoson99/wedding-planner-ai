import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import { AppAuthLayout } from './components/app-auth-layout'
import { ProtectedRoute } from './components/protected-route'

import NotMatch from './pages/NotMatch'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Guests from './pages/Guests'
import Agenda from './pages/Agenda'
import Budget from './pages/Budget'
import Providers from './pages/Providers'
import Settings from './pages/Settings'

import PublicRsvp from './pages/PublicRsvp'

import Login from './pages/Login'
import Register from './pages/Register'

export default function Router() {
  return (
    <Routes>
      {/* Auth routes (sin sidebar) */}
      <Route element={<AppAuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Public RSVP (sin login, sin layout) */}
      <Route path="/rsvp/:token" element={<PublicRsvp />} />

      {/* App routes (con sidebar) -> protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotMatch />} />
      </Route>
    </Routes>
  )
}
