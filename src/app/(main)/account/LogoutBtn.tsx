'use client'

import Btn from '@/components/ui/Btn'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LogoutBtn() {
  const t = useTranslations()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    try {
      // Sign out of Supabase
      await supabase.auth.signOut()

      // Calls the Abs server logout endpoint and clears the NextJS server cookies
      const res = await fetch('/internal-api/logout', {
        method: 'POST'
      })
      if (!res.ok) {
        console.error('Logout error:', res.status, res.statusText)
      }
      router.replace('/login')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Btn onClick={handleLogout} loading={loading} className="items-center justify-between gap-2 ps-6">
      <span className="material-symbols text-lg">logout</span>
      {t('LabelLogout')}
    </Btn>
  )
}
