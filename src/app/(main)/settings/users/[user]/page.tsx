import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import UserClient from './UserClient'

export const dynamic = 'force-dynamic'

export default async function UserPage({ params }: { params: Promise<{ user: string }> }) {
  const t = await getTypeSafeTranslations()
  const { user: userId } = await params

  const supabase = await createClient()
  const { data: user } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (!user) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-2 md:p-6">
      <div className="bg-bg mb-8 rounded-md border border-white/5 p-2 shadow-lg sm:p-4">
        <Link href="/settings/users" className="text-foreground-muted hover:text-foreground mb-4 flex items-center gap-2">
          <span className="material-symbols text-xl">arrow_back</span>
          <span>{t('LabelBackToUsers')}</span>
        </Link>
        <UserClient user={user as any} />
      </div>
    </div>
  )
}
