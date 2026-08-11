import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { appConfig, baseUrl } from '@/config/app'
import { useNavigate } from "react-router-dom";
import { logout, getWeddingDate, WEDDING_UPDATED_EVENT } from "@/lib/auth";
import { cn } from '@/lib/utils'
import { mainMenu } from '@/config/menu'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { AppLogo } from './app-logo'
import { WeddingSwitcher } from './wedding-switcher'
import { NotificationsBell } from './notifications-bell'
import { Button, buttonVariants } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import GitHub from './icons/github'
import { ModeToggle } from './mode-toggle'
import Countdown from './navbar/Countdown'

export function AppHeader() {
    const nav = useNavigate();
    const [weddingDate, setWeddingDate] = useState<string | null>(getWeddingDate());
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        const sync = () => setWeddingDate(getWeddingDate());
        // Refresh when the wedding is updated in this tab (Settings) or another tab.
        window.addEventListener(WEDDING_UPDATED_EVENT, sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener(WEDDING_UPDATED_EVENT, sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    async function handleLogout() {
        await logout();
        nav("/login", { replace: true });
    }
    return (
        <header className="bg-background sticky top-0 z-50 border-b">
            <div className="w-full max-w-7xl mx-auto flex justify-between items-center gap-2 h-14 mt-2 ps-4 md:pe-8">
                <div className='flex items-center gap-2 md:gap-0 min-w-0'>
                    {/* Mobile navigation drawer (the desktop sidebar is hidden on small screens) */}
                    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                        <SheetTrigger asChild>
                            <button
                                className="p-2 rounded hover:bg-muted focus:outline-none md:hidden"
                                aria-label="Abrir menú de navegación"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64">
                            <SheetHeader>
                                <SheetTitle>Menú</SheetTitle>
                            </SheetHeader>
                            <nav className="mt-2 space-y-1 px-2">
                                {mainMenu.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <NavLink
                                            key={item.url}
                                            to={item.url}
                                            end={item.url === '/'}
                                            onClick={() => setMobileNavOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                    isActive
                                                        ? 'bg-primary text-white'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`
                                            }
                                        >
                                            {Icon && <Icon className="size-5" />}
                                            {item.title}
                                        </NavLink>
                                    )
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <Link to="/">
                        <AppLogo />
                    </Link>
                    <div className="ml-1 md:ml-3 min-w-0">
                        <WeddingSwitcher />
                    </div>
                </div>

                {weddingDate && (
                    <div className="hidden md:block">
                        <Countdown weddingDate={weddingDate} />
                    </div>
                )}

                <nav className="flex gap-1 items-center">
                    <a
                        href={appConfig.github.url}
                        title={appConfig.github.title}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            buttonVariants({
                                variant: "ghost",
                                size: "icon",
                            }),
                            "size-8"
                        )}>
                        <GitHub />
                        <span className="sr-only">GitHub</span>
                    </a>
                    <NotificationsBell />
                    <div className="hidden md:block">
                        <ModeToggle />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                className='relative h-8 w-8 rounded-full cursor-pointer ml-2'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage src={baseUrl + '/avatars/shadcn.jpg'} alt='shadcn' />
                                    <AvatarFallback className="rounded-lg">SC</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-56' align='end' forceMount>
                            <DropdownMenuLabel className='font-normal'>
                                <div className='flex flex-col space-y-1'>
                                    <p className='text-sm font-medium leading-none'>shadcn</p>
                                    <p className='text-xs leading-none text-muted-foreground'>
                                        m@example.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>
            </div>
        </header >
    )
}