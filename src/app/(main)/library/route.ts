import { getCurrentUser } from '@/shared/lib/api'
import { getLibraries } from '@/shared/lib/api/libraries'
import { redirect } from 'next/navigation'

/**
 * GET /library
 * Redirects to the user's default library (or first available), or settings/account page.
 */
export const GET = async () => {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return redirect('/login?error=no_session')
    }

    let libraryId = currentUser.userDefaultLibraryId
    const userType = currentUser.user.type

    if (!libraryId) {
      try {
        const libs = await getLibraries()
        if (libs?.libraries?.length > 0) {
          libraryId = libs.libraries[0].id
        }
      } catch (err) {
        // Silently ignore and fall through
      }
    }

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
