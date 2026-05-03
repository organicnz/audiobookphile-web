import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts')

const nextConfig = async (phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {
  const baseConfig: NextConfig = {
    ...defaultConfig,
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
            value: 'camera=(), microphone=(), geolocations=(), interest-cohort=()'
          }
        ]
      }
    ],
    experimental: {
      serverActions: {
        bodySizeLimit: '10mb'
      }
    },
    images: {
      localPatterns: [{ pathname: '/api/**' }, { pathname: '/images/**' }]
    }
  }
  return withNextIntl(baseConfig)
}

export default nextConfig
