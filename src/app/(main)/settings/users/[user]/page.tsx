import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import { getUsers } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import UserClient from './UserClient'

export const dynamic = 'force-dynamic'

export default async function UserPage({ params }: { params: Promise<{ user: string }> }) {
  const t = await getTypeSafeTranslations()
  const { user: userId } = await params

  const { users } = await getUsers()
  const user = users.find((u: any) => u.id === userId)

  if (!user) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-2 md:p-6">
      <div className="bg-white/5 backdrop-blur-xl mb-8 rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-8">
        <Link href="/settings/users" className="text-white/40 hover:text-white mb-6 flex items-center gap-3 transition-colors group">
          <div className="bg-white/5 p-2 rounded-xl group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">{t('LabelBackToUsers')}</span>
        </Link>
        <UserClient user={user as any} />
      </div>
    </div>
  )
}
