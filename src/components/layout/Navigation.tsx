'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, PlusSquare, Users, Activity, LogOut, ShieldAlert, Settings } from 'lucide-react'
import { logout } from '@/app/login/actions'

const navItems = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Create', href: '/create', icon: PlusSquare },
  { name: 'Circles', href: '/circles', icon: Users },
  { name: 'Progress', href: '/progress', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  // Don't show nav on auth pages
  if (pathname === '/login') return null

  const finalNavItems = isAdmin ? [...navItems, { name: 'Admin', href: '/admin/email', icon: ShieldAlert }] : navItems

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-sidebar backdrop-blur-3xl border-t border-sidebar-border md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
          {finalNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-white/5 group transition-all duration-300 relative"
              >
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                )}
                <Icon
                  className={`w-6 h-6 mb-1 transition-transform duration-300 group-hover:-translate-y-1 ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'
                  }`}
                />
                <span
                  className={`text-[10px] transition-colors duration-300 ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="fixed top-0 left-0 z-40 hidden w-64 h-screen transition-transform -translate-x-full md:translate-x-0 md:block bg-sidebar backdrop-blur-3xl border-r border-sidebar-border shadow-[10px_0_40px_rgba(0,0,0,0.3)]">
        <div className="h-full px-3 py-4 flex flex-col">
          <div className="flex items-center mb-10 pl-2 mt-4">
            <span className="text-2xl font-semibold text-off-white tracking-tight">Aficionado</span>
          </div>
          <ul className="space-y-2 font-medium flex-1">
            {finalNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-xl group transition-all duration-300 relative overflow-hidden ${
                      isActive ? 'bg-sidebar-accent text-primary' : 'text-off-white hover:bg-white/5 hover:text-primary hover:pl-5'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                    )}
                    <Icon className="w-5 h-5 transition duration-300 group-hover:scale-110" />
                    <span className="ms-3">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-auto">
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center w-full p-3 rounded-xl group text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="w-5 h-5 transition duration-75" />
                <span className="ms-3">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
