import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import withPWAInit from '@ducanh2912/next-pwa'

const withNextIntl = createNextIntlPlugin('./src/shared/lib/i18n.ts')

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true
})

const nextConfig = async (phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {
  const baseConfig: NextConfig = {
    ...defaultConfig,
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
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
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
          }
        ]
      }
    ],
    experimental: {
      serverActions: {
        bodySizeLimit: '1gb'
      }
    },
    images: {
      localPatterns: [{ pathname: '/api/**' }, { pathname: '/images/**' }]
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
  org: 'zalesie',
  project: 'audiobookphile'
})
