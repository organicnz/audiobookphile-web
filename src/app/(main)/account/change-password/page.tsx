import { getTypeSafeTranslations } from '@/shared/lib/getTypeSafeTranslations'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ChangePasswordClient from './ChangePasswordClient'
import { changePassword } from './actions'

export default async function ChangePasswordPage() {
  const t = await getTypeSafeTranslations()

  return (
    <div className="mx-auto w-full max-w-xl p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link aria-label={t('ButtonBack')} href="/account" className="text-white/40 hover:text-white transition-colors group">
          <div className="bg-white/5 p-2 rounded-xl group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </div>
        </Link>
        <h1 className="text-xl font-black uppercase tracking-widest text-white/90">{t('HeaderChangePassword')}</h1>
      </div>
      <ChangePasswordClient changePassword={changePassword} />
    </div>
  )
}
