import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  environment: process.env.NODE_ENV || 'development',
  tracePropagationTargets: ['localhost', /^https:\/\/iambzzclljayqdxkeepy\.supabase\.co/],
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
    Sentry.extraErrorDataIntegration(),
    Sentry.reportingObserverIntegration(),
    Sentry.httpClientIntegration()
  ],
  // Enable GitHub integration for issue creation
  attachStacktrace: true,
  maxValueLength: 8192,
  normalizeDepth: 10,
  // Send default PII for better issue context (can be disabled per-user preference)
  sendDefaultPii: false,
  // Tag all events with release information
  _experiments: {
    // Enable metrics for performance monitoring
    metricsAggregator: true
  }
})
