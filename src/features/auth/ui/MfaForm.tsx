'use client'

import { useActionState, useState } from 'react'
import { verifyMfa } from '@/app/login/mfa/actions'
import { useFormStatus } from 'react-dom'

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,240,181,0.39)] hover:shadow-[0_6px_20px_rgba(0,240,181,0.5)] hover:-translate-y-0.5 active:scale-95"
    >
      {pending ? 'Verifying...' : 'Verify'}
    </button>
  )
}

export function MfaForm({ factorId }: { factorId: string }) {
  const [state, formAction] = useActionState(verifyMfa, null)
  const [code, setCode] = useState('')

  return (
    <div className="w-full max-w-md space-y-8 liquid-glass p-8 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-[80px] mix-blend-screen pointer-events-none transition-colors duration-1000 bg-primary/20"></div>

      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-off-white">
          Two-Factor Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Please enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <form action={formAction} className="mt-8 space-y-6">
        <input type="hidden" name="factorId" value={factorId} />
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="code" className="sr-only">Authentication Code</label>
            <input
              id="code"
              name="code"
              type="text"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-white/10 bg-white/5 text-off-white placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-lg text-center tracking-[0.25em] transition-all"
              placeholder="000000"
              maxLength={6}
            />
          </div>
        </div>

        {state?.error && (
          <div className="text-destructive text-sm text-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in-up">
            {state.error}
          </div>
        )}

        <SubmitButton disabled={code.length < 6} />
      </form>
    </div>
  )
}
