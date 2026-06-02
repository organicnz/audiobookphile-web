'use client'

import { HelpCircle } from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import Link from 'next/link'

export default function SettingsMoreInfoIcon(props: { moreInfoUrl: string }) {
  const t = useTypeSafeTranslations()

  return (
    <Tooltip text={t('LabelClickForMoreInfo')} position="right" closeOnClick className="leading-0">
      <Link href={props.moreInfoUrl} target="_blank" className="text-white/40 hover:text-primary transition-colors leading-0">
        <HelpCircle size={18} strokeWidth={2.5} />
      </Link>
    </Tooltip>
  )
}
