import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import { getCurrentUser } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function AccountStatsPage() {
  const t = await getTypeSafeTranslations()

  let currentUser
  try {
    currentUser = await getCurrentUser()
  } catch {
    return null
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-xl p-8">
      <h1 className="text-2xl">{t('HeaderStats')}</h1>
    </div>
  )
}
