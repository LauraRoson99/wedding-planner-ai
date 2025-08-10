import { Link, NavLink, useLocation } from 'react-router-dom'
import { mainMenu } from '@/config/menu'
import { appConfig, baseUrl } from '@/config/app'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react'
import { AppLogo } from './app-logo'
import { AppSidebar } from './app-sidebar'
import { Button, buttonVariants } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import GitHub from './icons/github'
import { ModeToggle } from './mode-toggle'
import Countdown from './navbar/Countdown'

export function AppHeader() {
    const location = useLocation()

    return (
        <header className="bg-background sticky top-0 z-50 border-b">
            <div className="w-full ~max-w-7xl mx-auto flex justify-between items-center gap-2 h-14 mt-2 ps-4 md:pe-8">
                <div className='flex items-center gap-2 md:gap-0'>
                    <button
                        // onClick={toggleSidebar}
                        className="p-2 rounded hover:bg-muted focus:outline-none"
                        aria-label="Toggle sidebar"
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
                    <Link to="/">
                        <AppLogo />
                    </Link>
                </div>

                <div className="hidden md:block">
                    <Countdown weddingDate="2025-10-10T13:00:00" />
                </div>

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
                            <DropdownMenuItem>Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>
            </div>
        </header >
    )
}