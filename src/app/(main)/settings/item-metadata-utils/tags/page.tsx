import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import { getLibraries, getLibraryFilterData } from '@/lib/supabase-api'
import SettingsContent from '../../SettingsContent'
import TagsClient from './TagsClient'

export const dynamic = 'force-dynamic'

export default async function ItemMetadataUtilsTagsPage() {
  const t = await getTypeSafeTranslations()

  let tags: string[] = []
  try {
    const { libraries } = await getLibraries()
    if (libraries.length > 0) {
      const filterData = await getLibraryFilterData(libraries[0].id)
      tags = filterData.tags
    }
  } catch (err) {
    console.error('Error loading tags', err)
  }

  return (
    <SettingsContent title={t('HeaderManageTags')} backLink="/settings/item-metadata-utils">
      <TagsClient tags={tags} />
    </SettingsContent>
  )
}
