import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Server-side: prefer SENTRY_DSN, fall back to the public DSN so existing
  // Vercel projects that only set NEXT_PUBLIC_SENTRY_DSN keep working.
  // Keeping the server DSN out of the NEXT_PUBLIC_* namespace avoids
  // inlining it into the client bundle where it is not needed.
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  environment: process.env.NODE_ENV || 'development',
  tracePropagationTargets: ['localhost', /^https:\/\/iambzzclljayqdxkeepy\.supabase\.co/],
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || undefined
})
