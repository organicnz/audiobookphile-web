'use client'

import Btn from '@/shared/ui/Btn'
import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { getLibraryItemCoverSrc, getPlaceholderCoverUrl } from '@/shared/lib/coverUtils'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useTransition } from 'react'

interface SearchClientProps {
  libraryId: string
  initialQuery: string
  initialResults: any
}

export default function SearchClient({ libraryId, initialQuery, initialResults }: SearchClientProps) {
  const t = useTypeSafeTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const q = (formData.get('q') as string) || ''
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (q) {
          params.set('q', q)
        } else {
          params.delete('q')
        }
        router.push(`/library/${libraryId}/search?${params.toString()}`)
      })
    },
    [libraryId, router, searchParams]
  )

  const items = useMemo(() => {
    return initialResults?.results || initialResults?.items || []
  }, [initialResults])

  const placeholder = getPlaceholderCoverUrl()

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">{t('ButtonSearch')}</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={initialQuery}
          placeholder={t('ButtonSearch')}
          className="bg-bg-light border-border focus:ring-primary flex-1 rounded-md border px-4 py-2 text-sm focus:ring-2 focus:outline-none"
          autoFocus
        />
        <Btn type="submit" loading={isPending} disabled={isPending} size="small">
          {t('ButtonSearch')}
        </Btn>
      </form>

      {/* Results */}
      {initialQuery && (
        <p className="text-foreground-muted mb-4 text-sm">
          {items.length === 0 ? `No results for "${initialQuery}"` : `${items.length} result${items.length !== 1 ? 's' : ''} for "${initialQuery}"`}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item: any) => {
          const itemId = item.id
          if (!itemId) return null

          const title = item.media?.metadata?.title || item.title || 'Unknown'
          const author = item.media?.metadata?.authorName || item.author_names_first_last || ''
          const coverSrc =
            item.coverPath || item.cover_path
              ? `/api/items/${itemId}/cover?ts=${item.updatedAt || item.updated_at || Date.now()}`
              : getLibraryItemCoverSrc(item, placeholder)

          return (
            <Link key={itemId} href={`/library/${libraryId}/item/${itemId}`} className="group flex flex-col gap-1">
              <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverSrc}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = placeholder
                  }}
                />
              </div>
              <p className="text-foreground line-clamp-2 text-xs font-medium">{title}</p>
              {author && <p className="text-foreground-muted line-clamp-1 text-xs">{author}</p>}
            </Link>
          )
        })}
      </div>

      {!initialQuery && (
        <div className="flex h-48 items-center justify-center">
          <p className="text-foreground-muted text-sm">{t('MessageNoResults')}</p>
        </div>
      )}
    </div>
  )
}
