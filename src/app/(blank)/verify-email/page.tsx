import AuthCard from '@/features/auth/components/AuthCard'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="-mt-[var(--header-height)] flex min-h-full items-center justify-center">
      <AuthCard title="Verify your email" icon="mark_email_unread">
        <p className="text-foreground-muted mb-6 text-sm">
          We sent a confirmation link to your email address. Click the link to activate your account.
        </p>
        <p className="text-foreground-muted text-sm">
          Already verified?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </div>
  )
}
