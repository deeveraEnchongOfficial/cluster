import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'

export function AppShell({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-1 flex-col min-w-0">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
