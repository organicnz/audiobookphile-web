import type { Metadata } from 'next'
import AppBar from '../AppBar'

export const metadata: Metadata = {
  title: 'audiobookphile - Admin Dashboard',
  description: 'audiobookphile server administration and telemetry'
}

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppBar />
      <div className="page-wrapper relative flex overflow-hidden">
        <div className="page-bg-gradient h-[calc(100vh-4rem)] min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
      </div>
    </>
  )
}
