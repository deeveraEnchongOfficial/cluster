import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Link } from '@inertiajs/react'

const DashboardLayout = ({ children, header }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [portfolioOpen, setPortfolioOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠', current: true },
    { name: 'Projects', href: '/projects', icon: '📁', current: false },
    { name: 'Files', href: '/files', icon: '📎', current: false },
    { name: 'Tasks', href: '/tasks', icon: '✅', current: false },
    { name: 'Team', href: '/team', icon: '👥', current: false },
    { name: 'Calendar', href: '/calendar', icon: '📅', current: false },
    { name: 'Reports', href: '/reports', icon: '📈', current: false },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center px-6 h-16 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center text-xl font-bold text-white">
            <span className="mr-2 text-yellow-400">⚡</span>
            Cluster
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-4 text-gray-400 lg:hidden hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="px-3 mt-6">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                  ${item.current
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <span className="mr-3 text-base">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Portfolio Section */}
          <div className="pt-6 mt-8 border-t border-gray-800">
            <button
              onClick={() => setPortfolioOpen(!portfolioOpen)}
              className="flex items-center px-3 py-2 w-full text-sm font-medium text-gray-300 rounded-md transition-colors duration-150 group hover:bg-gray-800 hover:text-white"
            >
              <span className="mr-3 text-base">💼</span>
              Portfolio
              <svg
                className={`ml-auto w-4 h-4 transition-transform duration-150 ${portfolioOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {portfolioOpen && (
              <div className="mt-1 ml-6 space-y-1">
                <Link
                  href="/portfolio/projects"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                >
                  <span className="mr-3 text-base">🎨</span>
                  Projects
                </Link>
                <Link
                  href="/portfolio/experience"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                >
                  <span className="mr-3 text-base">💡</span>
                  Experience
                </Link>
                <Link
                  href="/portfolio/skills"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                >
                  <span className="mr-3 text-base">🛠️</span>
                  Skills
                </Link>
                <Link
                  href="/portfolio/achievements"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                >
                  <span className="mr-3 text-base">🏆</span>
                  Achievements
                </Link>
                <Link
                  href="/portfolio/blogs"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                >
                  <span className="mr-3 text-base">📝</span>
                  Blogs
                </Link>
              </div>
            )}
          </div>

          <div className="pt-6 mt-8 border-t border-gray-800">
            <div className="space-y-1">
              <Link
                href="/profile"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md transition-colors duration-150 group hover:bg-gray-800 hover:text-white"
              >
                <span className="mr-3 text-base">👤</span>
                Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md transition-colors duration-150 group hover:bg-gray-800 hover:text-white"
              >
                <span className="mr-3 text-base">⚙️</span>
                Settings
              </Link>
              <Link
                href="/logout"
                method="post"
                className="flex items-center px-3 py-2 text-sm font-medium text-red-400 rounded-md transition-colors duration-150 group hover:bg-gray-800 hover:text-red-300"
              >
                <span className="mr-3 text-base">🚪</span>
                Logout
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-1 items-center max-w-2xl">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mr-4 text-gray-500 lg:hidden hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block py-2 pr-3 pl-10 w-full text-sm leading-5 placeholder-gray-400 bg-white rounded-lg border border-gray-200 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
                      placeholder="Search..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center ml-6 space-x-4">
                {/* Notifications */}
                <button className="relative text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 block h-1.5 w-1.5 rounded-full bg-red-400"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="hidden text-right sm:block">
                    <div className="text-sm font-medium text-gray-900">John Doe</div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </div>
                  <div className="flex justify-center items-center w-9 h-9 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                    JD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="overflow-auto flex-1">
          <div className="px-8 py-8 mx-auto max-w-7xl">
            {header && (
              <div className="mb-8">
                {header}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
