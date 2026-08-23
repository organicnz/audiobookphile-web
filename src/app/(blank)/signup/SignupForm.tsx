'use client'

import AuthCard from '@/features/auth/components/AuthCard'
import Link from 'next/link'

export default function SignupForm() {
  return (
    <AuthCard title="Invitation only" icon="shield-alert">
      <p className="text-foreground-muted mb-6 text-sm">Public registration is disabled. New accounts are created by invitation only.</p>
      <p className="text-foreground-muted mb-4 text-sm">If you&apos;ve received an invitation, check your email for a link to set up your account.</p>
      <p className="text-foreground-muted text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
