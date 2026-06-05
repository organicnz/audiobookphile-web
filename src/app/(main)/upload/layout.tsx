import type { Metadata } from 'next'
import '../../../assets/globals.css'
import AppBar from '../AppBar'
import UploadLayoutWrapper from './UploadLayoutWrapper'

export const metadata: Metadata = {
  title: 'audiobookphile',
  description: 'audiobookphile'
}

export default async function UploadLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AppBar />
      <UploadLayoutWrapper>{children}</UploadLayoutWrapper>
    </>
  )
}
