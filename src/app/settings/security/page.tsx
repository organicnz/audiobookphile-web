import { Suspense } from 'react'
import { SecuritySettings } from '@/components/settings/SecuritySettings'
import { createClient } from '@/utils/supabase/server'

export default async function SecurityPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.mfa.listFactors()
  
  const totpFactor = data?.totp?.[0]
  const initialIsEnrolled = totpFactor?.status === 'verified'
  const initialFactorId = totpFactor?.id || ''

  return (
    <div className="max-w-3xl px-4 py-8 mx-auto lg:py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-off-white">Security</h1>
        <p className="mt-2 text-muted-foreground">Manage your account security and two-factor authentication.</p>
      </header>

      <Suspense fallback={<div className="animate-pulse w-full h-64 bg-white/5 rounded-3xl" />}>
        <SecuritySettings initialIsEnrolled={initialIsEnrolled} initialFactorId={initialFactorId} />
      </Suspense>
    </div>
  )
}
