'use client'

import Btn from '@/shared/ui/Btn'
import IconBtn from '@/shared/ui/IconBtn'
import { useSettingsDrawer } from '@/shared/contexts/SettingsDrawerContext'
import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { ArrowLeft, Menu, Plus } from 'lucide-react'
import Link from 'next/link'
import SettingsMoreInfoIcon from './SettingsMoreInfoIcon'

interface AddButtonProps {
  label: string
  onClick: () => void
}

export default function SettingsContent(props: {
  children: React.ReactNode
  title: string
  description?: string
  moreInfoUrl?: string
  backLink?: string
  addButton?: AddButtonProps
  entityCount?: number
}) {
  const t = useTypeSafeTranslations()
  const { toggle } = useSettingsDrawer()

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-10">
      <IconBtn 
        className="mb-4 md:hidden bg-white/5 border-white/10" 
        ariaLabel={t('ButtonMenu')} 
        size="large" 
        borderless 
        onClick={toggle}
        icon={Menu}
      />
      <div className="bg-primary/95 backdrop-blur-xl border-white/10 mb-8 rounded-2xl border p-4 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          {props.backLink && (
            <Link aria-label={t('ButtonBack')} href={props.backLink} className="text-white/40 hover:text-primary transition-colors">
              <ArrowLeft size={22} strokeWidth={2.5} />
            </Link>
          )}
          <h1 className="text-xl font-black uppercase tracking-widest text-white/90">{props.title}</h1>
          {props.entityCount !== undefined && (
            <div className="bg-primary/10 text-primary flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-[10px] font-black uppercase tracking-widest">
              {props.entityCount}
            </div>
          )}
          {props.moreInfoUrl && <SettingsMoreInfoIcon moreInfoUrl={props.moreInfoUrl} />}
          <div className="grow" />
          {props.addButton && (
            <Btn 
              size="small" 
              onClick={props.addButton.onClick} 
              className="px-6 font-black uppercase tracking-widest text-[11px] bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={14} className="mr-2" strokeWidth={3} />
              {props.addButton.label}
            </Btn>
          )}
        </div>
        {props.description && <p className="text-white/40 mb-8 text-[13px] font-medium leading-relaxed max-w-2xl">{props.description}</p>}
        <div className="relative z-10">
          {props.children}
        </div>
      </div>
    </div>
  )
}
