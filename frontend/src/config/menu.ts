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
        icon: Home,
    },
    {
        title: 'Tareas',
        url: '/tasks',
        icon: ListCheck,
    },
    {
        title: 'Invitados',
        url: '/guests',
        icon: UsersRound,
    },
    {
        title: 'Agenda',
        url: '/agenda',
        icon: Calendar,
    },
    {
        title: 'Presupuesto',
        url: '/budget',
        icon: Wallet,
    },
    {
        title: 'Proveedores',
        url: '/providers',
        icon: Handshake,
    },
    {
        title: 'Ajustes',
        url: '/settings',
        icon: Settings,
    },
]
