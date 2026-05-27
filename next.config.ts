import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts')

const nextConfig = async (phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {
  const baseConfig: NextConfig = {
    ...defaultConfig,
    redirects: async () => [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ],
    rewrites: async () => [
      {
        source: '/login',
        destination: '/api/login',
      },
      {
        source: '/auth/refresh',
        destination: '/api/auth/refresh',
      },
    ],
    headers: async () => [
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
  return withNextIntl(baseConfig)
}

export default nextConfig
