import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/shared/lib/merge-classes'
import Indicator from './Indicator'

interface AlreadyInLibraryIndicatorProps {
  className?: string
}

const AlreadyInLibraryIndicator = ({ className }: AlreadyInLibraryIndicatorProps) => {
  const t = useTypeSafeTranslations()
  return (
    <Indicator tooltipText={t('LabelAlreadyInYourLibrary')} className={mergeClasses('text-success', className)}>
      check_circle
    </Indicator>
  )
}

export default AlreadyInLibraryIndicator
