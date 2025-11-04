'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { User, LogOut, Menu, X, Home, Users, Settings, Building } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Lazy load non-critical components
const ThemeToggle = dynamic(() => import('@/components/ui/theme-toggle').then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
  loading: () => <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
})

const LoadingScreen = dynamic(() => import('@/components/ui/loading-screen').then(mod => ({ default: mod.LoadingScreen })), {
  ssr: false
})

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use /dashboard/ in development, /dashboard/index.html in production/static
  const getRoute = (basePath: string) => {
    return process.env.NODE_ENV === 'development' 
      ? `${basePath}/` 
      : `${basePath}/index.html`;
  };

  const handleSignOut = async () => {
    await signOut()
    router.push(getRoute('/auth/login'))
  }

  const navigation = [
    { name: 'Dashboard', href: getRoute('/dashboard'), icon: Home },
    { name: 'Usuarios', href: getRoute('/admin/users'), icon: Users, adminOnly: parseInt(user?.su || '0') > 1 ? false : true },
    { name: 'Propiedades', href: getRoute('/properties'), icon: Building, adminOnly: parseInt(user?.su || '0') > 1 ? false : true },
    //{ name: 'Configuración', href: '/settings', icon: Settings },
  ]

  if (!mounted) {
    return <LoadingScreen isVisible={true} />
  }

  if (loading) {
    return <LoadingScreen isVisible={true} />
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar - Compact with icons only */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-16 flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navigation.map((item) => {
              if (item.adminOnly && user.email !== 'admin@urbex.com.co') return null
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="group relative flex items-center justify-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  title={item.name}
                >
                  <Icon className="w-5 h-5" />
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center p-2"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar - Full width on large screens */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:flex xl:w-64 xl:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Urbex</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              if (item.adminOnly && user.email !== 'admin@urbex.com.co') return null
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Tablet sidebar - Collapsed with icons only */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-16 lg:flex-col xl:hidden">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navigation.map((item) => {
              if (item.adminOnly && user.email !== 'admin@urbex.com.co') return null
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group relative flex items-center justify-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  title={item.name}
                >
                  <Icon className="w-5 h-5" />
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center p-2"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-16 xl:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 