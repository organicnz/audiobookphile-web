import type { Metadata } from 'next'
import '../../assets/globals.css'

export const metadata: Metadata = {
  title: 'audiobookphile'
}

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
