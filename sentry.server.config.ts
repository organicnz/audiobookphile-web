import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://73b955343fb09bc7770dc93fa7d2c18a@o4509901022691328.ingest.de.sentry.io/4511573264236624',
  tracesSampleRate: 1.0,
  debug: false,
  environment: process.env.NODE_ENV || 'development',
  tracePropagationTargets: ['localhost', /^https:\/\/iambzzclljayqdxkeepy\.supabase\.co/],
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || undefined
})
