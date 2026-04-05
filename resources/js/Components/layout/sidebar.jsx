import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { cn } from '@/lib/utils'
import { Button } from '@/Components/ui/button'
import { Separator } from '@/Components/ui/separator'
import { useTheme } from '@/Components/theme-provider'
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    CheckSquare,
    Users,
    Calendar,
    BarChart3,
    Briefcase,
    Palette,
    Lightbulb,
    Wrench,
    Trophy,
    BookOpen,
    User,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    Sun,
    Moon,
    Bell,
} from 'lucide-react'

export function Sidebar({ isOpen, onClose }) {
    const { url, props } = usePage()
    const [portfolioOpen, setPortfolioOpen] = useState(url.startsWith('/portfolio'))
    const { theme, setTheme } = useTheme()
    const user = props.auth?.user

    const isActive = (href) => {
        if (href === '/dashboard') return url === '/dashboard'
        return url.startsWith(href)
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Projects', href: '/projects', icon: FolderKanban },
        { name: 'Files', href: '/files', icon: FileText },
        { name: 'Tasks', href: '/tasks', icon: CheckSquare },
        { name: 'Team', href: '/team', icon: Users },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
    ]

    const portfolioItems = [
        { name: 'Projects', href: '/portfolio/projects', icon: Palette },
        { name: 'Experience', href: '/portfolio/experience', icon: Lightbulb },
        { name: 'Skills', href: '/portfolio/skills', icon: Wrench },
        { name: 'Achievements', href: '/portfolio/achievements', icon: Trophy },
        { name: 'Blogs', href: '/portfolio/blogs', icon: BookOpen },
    ]

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 h-full border-r transition-transform duration-300 ease-in-out transform bg-sidebar border-sidebar-border lg:relative lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex flex-shrink-0 items-center px-6 h-16 border-b border-sidebar-border">
                        <Link href="/dashboard" className="flex gap-2 items-center font-semibold">
                            <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold text-sidebar-foreground">Cluster</span>
                        </Link>
                    </div>

                    <div className="overflow-y-auto flex-1 px-3 py-4">
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.href)
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'flex gap-3 items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                            active
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>

                        <Separator className="my-4" />

                        <div className="space-y-1">
                            <button
                                onClick={() => setPortfolioOpen(!portfolioOpen)}
                                className={cn(
                                    'flex gap-3 items-center px-3 py-2 w-full text-sm font-medium rounded-lg transition-colors',
                                    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                )}
                            >
                                <Briefcase className="w-4 h-4" />
                                <span className="flex-1 text-left">Portfolio</span>
                                {portfolioOpen ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>

                            {portfolioOpen && (
                                <div className="pl-3 ml-4 space-y-1 border-l border-sidebar-border">
                                    {portfolioItems.map((item) => {
                                        const Icon = item.icon
                                        const active = isActive(item.href)
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={cn(
                                                    'flex gap-3 items-center px-3 py-2 text-sm rounded-lg transition-colors',
                                                    active
                                                        ? 'font-medium bg-sidebar-accent text-sidebar-accent-foreground'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {item.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <Separator className="my-4" />

                        {/* Theme, Notification, and Profile Icons */}
                        <div className="space-y-1">
                            <Button
                                variant="ghost"
                                className="gap-3 justify-start px-3 py-2 w-full h-auto"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-4 h-4" />
                                ) : (
                                    <Moon className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">
                                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                </span>
                            </Button>

                            <Button
                                variant="ghost"
                                className="relative gap-3 justify-start px-3 py-2 w-full h-auto"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
                                <span className="text-sm font-medium">Notifications</span>
                            </Button>

                            <Button
                                variant="ghost"
                                className="gap-3 justify-start px-3 py-2 w-full h-auto"
                                onClick={() => window.location.href = '/profile'}
                            >
                                <div className="relative w-4 h-4">
                                    <div className="flex justify-center items-center w-4 h-4 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </div>
                                <span className="text-sm font-medium">Profile</span>
                            </Button>
                        </div>

                        <Separator className="my-4" />

                        <nav className="space-y-1">
                            <Link
                                href="/profile"
                                className={cn(
                                    'flex gap-3 items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                    isActive('/profile')
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                )}
                            >
                                <User className="w-4 h-4" />
                                Edit Profile
                            </Link>
                            <Link
                                href="/settings"
                                className={cn(
                                    'flex gap-3 items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                    isActive('/settings')
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                )}
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex gap-3 items-center px-3 py-2 w-full text-sm font-medium rounded-lg transition-colors text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Link>
                        </nav>
                    </div>
                </div>
            </aside>
        </>
    )
}
