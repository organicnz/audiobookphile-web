'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Mail, Users, ShieldAlert } from 'lucide-react'

const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
  { name: 'Send Email', href: '/admin/email', icon: Mail },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {adminNavItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
              isActive
                ? 'bg-white/8 text-foreground'
                : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-muted-gold rounded-r-full shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            )}
            <Icon className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 ${
              isActive ? 'text-muted-gold' : ''
            }`} />
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
