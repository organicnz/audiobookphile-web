import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import { getLibraries, getLibraryFilterData } from '@/lib/supabase-api'
import SettingsContent from '../../SettingsContent'
import GenresClient from './GenresClient'

export const dynamic = 'force-dynamic'

export default async function ItemMetadataUtilsGenresPage() {
  const t = await getTypeSafeTranslations()

  // Get genres from the first available library
  let genres: string[] = []
  try {
    const { libraries } = await getLibraries()
    if (libraries.length > 0) {
      const filterData = await getLibraryFilterData(libraries[0].id)
      genres = filterData.genres
    }
  } catch (err) {
    console.error('Error loading genres', err)
  }

  return (
    <SettingsContent title={t('HeaderManageGenres')} backLink="/settings/item-metadata-utils">
      <GenresClient genres={genres} />
    </SettingsContent>
  )
}
