'use client'

import { usePathname } from 'next/navigation'
import { Home, Compass, PlusSquare, MonitorPlay, Settings, ShieldAlert, LucideIcon } from 'lucide-react'
import { SidebarNav } from './SidebarNav'
import { BottomNav } from './BottomNav'

export type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
}

export type NavigationItems = NavigationItem[]

const navItems: NavigationItems = [
  { name: 'Feed', href: '/home', icon: Home },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Create', href: '/create', icon: PlusSquare },
  { name: 'Studio', href: '/creator', icon: MonitorPlay },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  // Don't show nav on auth pages
  if (pathname === '/login' || pathname.startsWith('/login/')) return null

  const finalNavItems = isAdmin ? [...navItems, { name: 'Admin', href: '/admin/email', icon: ShieldAlert }] : navItems

  return (
    <>
      <BottomNav navItems={finalNavItems} pathname={pathname} />
      <SidebarNav navItems={finalNavItems} pathname={pathname} />
    </>
  )
}
