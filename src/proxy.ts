import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Next.js 16 Proxy (formerly Middleware)
 * 
 * As of Next.js 16, the `middleware.ts` convention has been renamed to `proxy.ts`.
 * This function handles Supabase session updates and token refreshing for all
 * matched routes, ensuring authentication state is persisted across requests.
 * 
 * @see https://nextjs.org/docs/messages/middleware-to-proxy
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
