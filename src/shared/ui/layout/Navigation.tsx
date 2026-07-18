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

export function Navigation({ isAdmin = false, userType }: { isAdmin?: boolean; userType?: 'aficionado' | 'fan' | null }) {
  const pathname = usePathname()

  // Don't show nav on auth pages
  if (pathname === '/login' || pathname.startsWith('/login/')) return null

  let finalNavItems = navItems

  if (userType === 'fan') {
    finalNavItems = finalNavItems.filter(item => item.name !== 'Studio' && item.name !== 'Create')
  } else if (userType === 'aficionado') {
    finalNavItems = finalNavItems.filter(item => item.name !== 'Explore' && item.name !== 'Create')
  }

  if (isAdmin) {
    finalNavItems = [...finalNavItems, { name: 'Admin', href: '/admin/email', icon: ShieldAlert }]
  }

  return (
    <>
      <BottomNav navItems={finalNavItems} pathname={pathname} />
      <SidebarNav navItems={finalNavItems} pathname={pathname} />
    </>
  )
}
