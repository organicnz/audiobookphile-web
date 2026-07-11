'use client'

import { useActionState, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/core/card'
import { Shield, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { enrollMfa, verifyAndEnableMfa, unenrollMfa } from '@/app/settings/security/actions'
import { useFormStatus } from 'react-dom'

function SubmitButton({ text, pendingText, disabled, variant = 'primary' }: { text: string, pendingText: string, disabled?: boolean, variant?: 'primary' | 'destructive' | 'outline' }) {
  const { pending } = useFormStatus()
  
  let className = "px-6 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full active:scale-95 disabled:opacity-50 "
  
  if (variant === 'primary') {
    className += "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_0_rgba(0,240,181,0.39)] hover:shadow-[0_6px_20px_rgba(0,240,181,0.5)]"
  } else if (variant === 'destructive') {
    className += "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
  } else {
    className += "bg-white/10 text-off-white border border-white/20 hover:bg-white/20 hover:border-white/30"
  }

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={className}
    >
      {pending ? pendingText : text}
    </button>
  )
}

export function MfaToggleCard({ initialIsEnrolled, initialFactorId }: { initialIsEnrolled: boolean, initialFactorId: string }) {
  const [enrollState, enrollAction] = useActionState(enrollMfa, null)
  const [verifyState, verifyAction] = useActionState(verifyAndEnableMfa, null)
  const [unenrollState, unenrollAction] = useActionState(unenrollMfa, null)
  const [code, setCode] = useState('')
  const [isCancelled, setIsCancelled] = useState(false)

  // Determine actual state based on initial props and current action states
  const isEnrolled = (!unenrollState?.success && (initialIsEnrolled || verifyState?.success))
  const isEnrolling = !!enrollState?.qrCode && !verifyState?.success && !isCancelled
  const factorId = enrollState?.factorId || initialFactorId
  const error = enrollState?.error || verifyState?.error || unenrollState?.error

  return (
    <div className="space-y-6">
      <Card className="liquid-glass-hover border-white/10 overflow-hidden animate-fade-in-up transition-all duration-500">
        <CardHeader>
          <CardTitle className="text-off-white flex items-center gap-2">
            {isEnrolled ? (
              <Shield className="w-6 h-6 text-primary" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-muted-foreground" />
            )}
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Add an extra layer of security to your account by requiring a code from an authenticator app when you log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {isEnrolled ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-medium text-primary">2FA is Enabled</h3>
                  <p className="text-sm text-primary/80">Your account is secured with two-factor authentication.</p>
                </div>
              </div>
              
              <form action={unenrollAction} onSubmit={(e) => {
                if (!confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
                  e.preventDefault()
                }
              }}>
                <input type="hidden" name="factorId" value={factorId} />
                <SubmitButton text="Disable 2FA" pendingText="Disabling..." variant="destructive" />
              </form>
            </div>
          ) : isEnrolling ? (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-off-white">1. Scan the QR Code</h3>
                <p className="text-sm text-muted-foreground">
                  Open your authenticator app (like Google Authenticator, Authy, or 1Password) and scan this QR code.
                </p>
                <div 
                  className="bg-white p-4 rounded-xl inline-block max-w-[200px]"
                  dangerouslySetInnerHTML={{ __html: enrollState?.qrCode || '' }}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-off-white">2. Enter the Code</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code generated by your app to verify setup.
                </p>
                
                <form action={verifyAction} className="flex gap-4 max-w-sm">
                  <input type="hidden" name="factorId" value={factorId} />
                  <input
                    type="text"
                    name="code"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="flex-1 appearance-none rounded-xl relative block px-3 py-3 border border-white/10 bg-white/5 text-off-white placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-lg text-center tracking-[0.25em] transition-all"
                  />
                  <SubmitButton text="Verify" pendingText="Verifying..." disabled={code.length < 6} />
                </form>
              </div>
              
              <div>
                <button
                  onClick={() => setIsCancelled(true)}
                  className="text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Cancel setup
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Two-factor authentication is currently disabled. We strongly recommend enabling it to protect your wellness data.
              </p>
              <form action={enrollAction} onSubmit={() => { setIsCancelled(false) }}>
                <SubmitButton text="Set Up 2FA" pendingText="Loading..." variant="outline" />
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
