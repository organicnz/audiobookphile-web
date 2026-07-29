'use client'

import { useState, useCallback } from 'react'
import { Shield, ShieldAlert, ShieldCheck, Copy, Check, Key, QrCode } from 'lucide-react'
import Btn from '@/shared/ui/Btn'
import TextInput from '@/shared/ui/TextInput'
import { createClient } from '@/shared/utils/supabase/client'

interface TwoFactorSettingsPanelProps {
  initialEnabled?: boolean
}

export default function TwoFactorSettingsPanel({ initialEnabled = false }: TwoFactorSettingsPanelProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled)
  const [mode, setMode] = useState<'idle' | 'enrolling' | 'disabling'>('idle')
  const [secret, setSecret] = useState('')
  const [uri, setUri] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopySecret = useCallback(async () => {
    if (!secret) return
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore clipboard error
    }
  }, [secret])

  const handleStartEnroll = useCallback(async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        setError('Your session has expired. Please log in again.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/auth/2fa/enroll', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to start 2FA setup.')
        setLoading(false)
        return
      }

      setSecret(data.secret || '')
      setUri(data.uri || '')
      setVerificationCode('')
      setMode('enrolling')
    } catch {
      setError('Unable to reach server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleVerifyEnroll = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!verificationCode || verificationCode.trim().length !== 6) {
        setError('Please enter a valid 6-digit verification code.')
        return
      }

      setError('')
      setSuccess('')
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        if (!token) {
          setError('Your session has expired. Please log in again.')
          setLoading(false)
          return
        }

        const res = await fetch('/api/auth/2fa/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ code: verificationCode.trim() })
        })

        const data = await res.json()
        if (!res.ok || !data.success) {
          setError(data.error || 'Invalid verification code. Try again with a new code.')
          setLoading(false)
          return
        }

        setIsEnabled(true)
        setMode('idle')
        setSecret('')
        setUri('')
        setVerificationCode('')
        setSuccess('Two-factor authentication has been successfully enabled for your account.')
      } catch {
        setError('Unable to verify two-factor code. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [verificationCode]
  )

  const handleDisable2FA = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!disableCode || disableCode.trim().length !== 6) {
        setError('Please enter your 6-digit code to disable 2FA.')
        return
      }

      setError('')
      setSuccess('')
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        if (!token) {
          setError('Your session has expired. Please log in again.')
          setLoading(false)
          return
        }

        const res = await fetch('/api/auth/2fa/disable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ code: disableCode.trim() })
        })

        const data = await res.json()
        if (!res.ok || !data.success) {
          setError(data.error || 'Invalid verification code.')
          setLoading(false)
          return
        }

        setIsEnabled(false)
        setMode('idle')
        setDisableCode('')
        setSuccess('Two-factor authentication has been disabled.')
      } catch {
        setError('Unable to disable two-factor authentication. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [disableCode]
  )

  return (
    <div className="border-border bg-bg-light/80 rounded-2xl border p-6 shadow-xl backdrop-blur-md transition-all">
      <div className="border-border/50 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-accent/15 text-accent flex h-11 w-11 items-center justify-center rounded-xl shadow-inner">
            {isEnabled ? <ShieldCheck className="h-6 w-6 text-emerald-400" /> : <Shield className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-foreground text-lg font-bold tracking-tight">Two-Factor Authentication (2FA)</h3>
            <p className="text-foreground-muted text-xs">Secure your account with time-based one-time passcodes (TOTP).</p>
          </div>
        </div>

        <div>
          {isEnabled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Disabled
            </span>
          )}
        </div>
      </div>

      {error && <div className="my-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">{error}</div>}

      {success && <div className="my-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">{success}</div>}

      {mode === 'idle' && (
        <div className="mt-5 space-y-4">
          <p className="text-foreground-muted text-sm leading-relaxed">
            Two-factor authentication adds an extra layer of defense to your account. In addition to your password, you will be prompted for a secure 6-digit
            code from an authenticator app (Google Authenticator, Authy, Apple Keychain, or 1Password) whenever you sign in.
          </p>

          <div className="pt-2">
            {!isEnabled ? (
              <Btn onClick={handleStartEnroll} loading={loading} className="px-5 py-2.5">
                Set Up Two-Factor Authentication
              </Btn>
            ) : (
              <Btn
                onClick={() => {
                  setError('')
                  setSuccess('')
                  setMode('disabling')
                }}
                color="bg-red-600/80 hover:bg-red-600"
                className="px-5 py-2.5"
              >
                Disable Two-Factor Authentication
              </Btn>
            )}
          </div>
        </div>
      )}

      {mode === 'enrolling' && (
        <form onSubmit={handleVerifyEnroll} className="mt-6 space-y-6">
          <div className="border-border bg-bg/60 space-y-4 rounded-xl border p-4">
            <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <Key className="text-accent h-4 w-4" />
              1. Add secret key to your authenticator app
            </h4>
            <p className="text-foreground-muted text-xs leading-relaxed">
              Open your authenticator app and choose <strong>Add Account via Secret Key</strong>, or copy the URI below.
            </p>

            <div className="flex items-center gap-2">
              <code className="border-border bg-bg-dark/80 text-accent flex-1 overflow-x-auto rounded-lg border px-3 py-2 font-mono text-xs tracking-wider select-all">
                {secret}
              </code>
              <button
                type="button"
                onClick={handleCopySecret}
                className="border-border bg-bg-light hover:bg-border text-foreground flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                title="Copy Secret"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {uri && (
              <div className="pt-2">
                <p className="text-foreground-muted font-mono text-[11px] break-all opacity-70">{uri}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <QrCode className="text-accent h-4 w-4" />
              2. Enter the 6-digit verification code
            </h4>
            <div className="max-w-xs">
              <TextInput
                label="Verification Code"
                value={verificationCode}
                type="text"
                autocomplete="one-time-code"
                placeholder="000000"
                onChange={setVerificationCode}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Btn type="submit" loading={loading} className="px-6 py-2.5">
              Verify & Activate 2FA
            </Btn>
            <button
              type="button"
              onClick={() => {
                setMode('idle')
                setError('')
              }}
              className="text-foreground-muted hover:text-foreground px-3 py-2 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === 'disabling' && (
        <form onSubmit={handleDisable2FA} className="mt-6 space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-200/90">
              Disabling two-factor authentication will remove the extra security verification step from your account during sign-in.
            </p>
          </div>

          <div className="max-w-xs">
            <TextInput
              label="Enter your 6-digit authenticator code"
              value={disableCode}
              type="text"
              autocomplete="one-time-code"
              placeholder="000000"
              onChange={setDisableCode}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Btn type="submit" loading={loading} color="bg-red-600/80 hover:bg-red-600" className="px-6 py-2.5">
              Confirm Disable 2FA
            </Btn>
            <button
              type="button"
              onClick={() => {
                setMode('idle')
                setError('')
              }}
              className="text-foreground-muted hover:text-foreground px-3 py-2 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
