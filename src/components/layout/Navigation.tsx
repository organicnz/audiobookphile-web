'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, PlusSquare, Users, Activity } from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Create', href: '/create', icon: PlusSquare },
  { name: 'Circles', href: '/circles', icon: Users },
  { name: 'Progress', href: '/progress', icon: Activity },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-charcoal/80 backdrop-blur-xl border-t border-white/10 md:hidden">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-white/5 group"
              >
                <Icon
                  className={`w-6 h-6 mb-1 ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'
                  }`}
                />
                <span
                  className={`text-xs ${
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
      <aside className="fixed top-0 left-0 z-40 hidden w-64 h-screen transition-transform -translate-x-full md:translate-x-0 md:block bg-charcoal/50 backdrop-blur-2xl border-r border-white/10">
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center mb-10 pl-2 mt-4">
            <span className="text-2xl font-semibold text-off-white tracking-tight">Aficionado</span>
          </div>
          <ul className="space-y-2 font-medium">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-xl group ${
                      isActive ? 'bg-white/10 text-primary' : 'text-off-white hover:bg-white/5 hover:text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5 transition duration-75" />
                    <span className="ms-3">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>
    </>
  )
}
