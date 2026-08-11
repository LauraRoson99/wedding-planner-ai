import type { LucideIcon } from 'lucide-react'
import {
    Home,
    ListCheck,
    UsersRound,
    Calendar,
    Wallet,
    Handshake,
    Settings,
} from 'lucide-react'

type MenuItemType = {
    title: string
    url: string
    description?: string
    external?: string
    icon?: LucideIcon
    items?: MenuItemType[]
}
type MenuType = MenuItemType[]

// Titles are user-facing labels, kept in Spanish (product language).
export const mainMenu: MenuType = [
    {
        title: 'Inicio',
        url: '/',
        description: 'Resumen general de tu boda',
        icon: Home,
    },
    {
        title: 'Tareas',
        url: '/tasks',
        description: 'Checklist con prioridad, categoría y fechas',
        icon: ListCheck,
    },
    {
        title: 'Invitados',
        url: '/guests',
        description: 'Lista, grupos, mesas e invitaciones/RSVP',
        icon: UsersRound,
    },
    {
        title: 'Agenda',
        url: '/agenda',
        description: 'Calendario de eventos y fechas clave',
        icon: Calendar,
    },
    {
        title: 'Presupuesto',
        url: '/budget',
        description: 'Partidas de gasto, pagos y gráficas',
        icon: Wallet,
    },
    {
        title: 'Proveedores',
        url: '/providers',
        description: 'Contactos, estados y documentos',
        icon: Handshake,
    },
    {
        title: 'Ajustes',
        url: '/settings',
        description: 'Datos de la boda, perfil y contraseña',
        icon: Settings,
    },
]
