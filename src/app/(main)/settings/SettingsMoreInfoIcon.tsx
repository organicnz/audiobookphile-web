'use client'

import { HelpCircle } from 'lucide-react'
import Tooltip from '@/shared/ui/Tooltip'
import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import Link from 'next/link'

export default function SettingsMoreInfoIcon(props: { moreInfoUrl: string }) {
  const t = useTypeSafeTranslations()

  return (
    <Tooltip text={t('LabelClickForMoreInfo')} position="right" closeOnClick className="leading-0">
      <Link href={props.moreInfoUrl} target="_blank" className="hover:text-primary leading-0 text-white/40 transition-colors">
        <HelpCircle size={18} strokeWidth={2.5} />
      </Link>
    </Tooltip>
  )
}
