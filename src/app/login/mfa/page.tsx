import { Suspense } from 'react'
import { MfaForm } from '@/components/auth/MfaForm'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function MfaPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.listFactors()
  
  const factorId = data?.totp?.[0]?.id

  if (error || !factorId) {
    redirect('/login?message=No TOTP factor found')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-white/5 rounded-3xl" />}>
        <MfaForm factorId={factorId} />
      </Suspense>
    </div>
  )
}
