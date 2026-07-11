import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import type { Metadata } from 'next'
import { AdminSidebar } from './AdminSidebar'

export const metadata: Metadata = {
  title: 'Admin Center — Aficionado',
  description: 'Administrative dashboard for the Aficionado platform.',
  robots: { index: false, follow: false },
}

const ADMIN_EMAILS = [
  'devastatingdebater@gmail.com',
  'tamerlanium@gmail.com',
  'support@aficionado.fans',
  'contact@aficionado.fans'
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    redirect('/home')
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-24 px-4 md:px-8 max-w-7xl mx-auto gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="glass-panel p-6 rounded-2xl sticky top-24 shimmer">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted-gold to-primary flex items-center justify-center">
              <span className="text-xs font-bold text-background">A</span>
            </div>
            <h2 className="text-lg font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Admin Center
            </h2>
          </div>
          <AdminSidebar />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
          {/* Subtle gradient background flair */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-ocean-muted/10 rounded-full blur-[60px] -z-10 mix-blend-screen pointer-events-none" />
          
          {children}
        </div>
      </main>
    </div>
  )
}
