import { getCurrentUser } from '@/shared/lib/api'
import { redirect } from 'next/navigation'

/**
 * GET /library
 * Redirects to the user's default library or settings/account page.
 */
export const GET = async () => {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return redirect('/login?error=no_session')
    }

    const libraryId = currentUser.userDefaultLibraryId
    const userType = currentUser.user.type

    if (libraryId) {
      return redirect(`/library/${libraryId}`)
    }

    if (['admin', 'root'].includes(userType)) {
      return redirect('/settings')
    }

    return redirect('/account')
  } catch (error) {
    // Re-throw redirect errors
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      throw error
    }
    return redirect('/login?error=unauthorized')
  }
}
