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
        <Link aria-label={t('ButtonBack')} href="/account" className="group text-white/40 transition-colors hover:text-white">
          <div className="rounded-xl bg-white/5 p-2 transition-colors group-hover:bg-white/10">
            <ArrowLeft size={20} />
          </div>
        </Link>
        <h1 className="text-xl font-black tracking-widest text-white/90 uppercase">{t('HeaderChangePassword')}</h1>
      </div>
      <ChangePasswordClient changePassword={changePassword} />
    </div>
  )
}
