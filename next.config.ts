import withPWAInit from '@ducanh2912/next-pwa'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/shared/lib/i18n.ts')

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true
})

const nextConfig = async (phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {
  // Fail soft in lint/typecheck/test so `tsc --noEmit` and `oxlint` work
  // without a full env; hard-fail only for real builds/serves.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const isBuildPhase = phase === 'phase-production-build' || phase === 'phase-production-server' || phase === 'phase-development-server'
    const message =
      '[next.config.ts] Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL\n' +
      'All /api/* proxy rewrites will point to "undefined/functions/v1/..." without it.\n' +
      'Add it to your .env.local (development) or Vercel environment variables (Production/Preview/Development).\n' +
      'See .env.example for the full list of required variables.'
    if (isBuildPhase) {
      throw new Error(message)
    }
    console.warn(message)
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://placeholder.supabase.co'
  }

  const baseConfig: NextConfig = {
    ...defaultConfig,
    reactCompiler: true,
    redirects: async () => [
      {
        source: '/',
        destination: '/login',
        permanent: false
      }
    ],
    rewrites: async () => [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api/:path*`
      }
    ],
    headers: async () => [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com https://us-assets.i.posthog.com https://eu-assets.i.posthog.com https://*.sentry.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https: blob: data:",
              "connect-src 'self' https: wss:",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ]
      }
    ],
    experimental: {
      serverActions: {
        bodySizeLimit: '1gb'
      },
      turbopackRustReactCompiler: true,
      useOffline: true
    },
    images: {
      localPatterns: [{ pathname: '/api/**' }, { pathname: '/images/**' }],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.supabase.co'
        }
      ],
      minimumCacheTTL: 14400
    },
    logging: {
      fetches: {
        fullUrl: true
      }
    }
  }
  return withPWA(withNextIntl(baseConfig))
}

import { withSentryConfig } from '@sentry/nextjs'

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'organicnz',
  project: 'audiobookphile',
  // Widen source map upload scope for better stack traces on errors
  widenClientFileUpload: true,
  // Delete source maps after uploading to Sentry to prevent public access
  sourcemaps: {
    deleteSourcemapsAfterUpload: true
  },
  // Tree-shake Sentry logger statements in production for smaller bundles
  disableLogger: true
})
