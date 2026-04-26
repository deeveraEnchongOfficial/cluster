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
    File,
    Plus,
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
    const [settingsOpen, setSettingsOpen] = useState(url.startsWith('/settings'))
    const [documentationOpen, setDocumentationOpen] = useState(url.startsWith('/documentation'))
    const { theme, setTheme } = useTheme()
    const user = props.auth?.user
    const pages = props.pages || []

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

    const settingsItems = [
        { name: 'Integrations', href: '/settings', icon: Settings },
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

                        <div className="space-y-1">
                            <button
                                onClick={() => setDocumentationOpen(!documentationOpen)}
                                className={cn(
                                    'flex gap-3 items-center px-3 py-2 w-full text-sm font-medium rounded-lg transition-colors',
                                    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                )}
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="flex-1 text-left">Documentation</span>
                                {documentationOpen ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>

                            {documentationOpen && (
                                <div className="pl-3 ml-4 space-y-1 border-l border-sidebar-border">
                                    {pages.length === 0 ? (
                                        <Link
                                            href="/documentation/create"
                                            className={cn(
                                                'flex gap-3 items-center px-3 py-2 text-sm rounded-lg transition-colors',
                                                isActive('/documentation/create')
                                                    ? 'font-medium bg-sidebar-accent text-sidebar-accent-foreground'
                                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                            )}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create Page
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/documentation/create"
                                                className={cn(
                                                    'flex gap-3 items-center px-3 py-2 text-sm rounded-lg transition-colors',
                                                    isActive('/documentation/create')
                                                        ? 'font-medium bg-sidebar-accent text-sidebar-accent-foreground'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                                )}
                                            >
                                                <Plus className="w-4 h-4" />
                                                New Page
                                            </Link>
                                            {pages.map((page) => (
                                                <Link
                                                    key={page.id}
                                                    href={`/documentation/${page.id}`}
                                                    className={cn(
                                                        'flex gap-3 items-center px-3 py-2 text-sm rounded-lg transition-colors',
                                                        url === `/documentation/${page.id}`
                                                            ? 'font-medium bg-sidebar-accent text-sidebar-accent-foreground'
                                                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                                    )}
                                                >
                                                    <File className="w-4 h-4" />
                                                    <span className="truncate">{page.title || 'Untitled'}</span>
                                                </Link>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-1">
                            <button
                                onClick={() => setSettingsOpen(!settingsOpen)}
                                className={cn(
                                    'flex gap-3 items-center px-3 py-2 w-full text-sm font-medium rounded-lg transition-colors',
                                    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                )}
                            >
                                <Settings className="w-4 h-4" />
                                <span className="flex-1 text-left">Settings</span>
                                {settingsOpen ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>

                            {settingsOpen && (
                                <div className="pl-3 ml-4 space-y-1 border-l border-sidebar-border">
                                    {settingsItems.map((item) => {
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
