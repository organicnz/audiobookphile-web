import { EntityType } from '@/types/api'
import { Suspense } from 'react'

import BookshelfClient from './BookshelfClient'

export default async function EntityPage({ params }: { params: Promise<{ library: string; entityType: string }> }) {
  const { entityType: entityTypeString } = await params
  const entityType = entityTypeString as EntityType

  return (
    <div className="h-full w-full">
      <Suspense fallback={null}>
        <BookshelfClient key={entityType} entityType={entityType} />
      </Suspense>
    </div>
  )
}
