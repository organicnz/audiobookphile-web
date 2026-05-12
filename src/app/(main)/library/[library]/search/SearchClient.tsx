'use client'

import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { getPlaceholderCoverUrl } from '@/lib/coverUtils'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface SearchClientProps {
  libraryId: string
  initialQuery: string
  initialResults: any[]
}

export default function SearchClient({ libraryId, initialQuery, initialResults }: SearchClientProps) {
  const t = useTypeSafeTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const q = (form.elements.namedItem('q') as HTMLInputElement).value.trim()
      if (!q) return
      startTransition(() => {
        router.push(`/library/${libraryId}/search?q=${encodeURIComponent(q)}`)
      })
    },
    [libraryId, router]
  )

  const placeholder = getPlaceholderCoverUrl()

  return (
    <div className="w-full p-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={initialQuery}
          placeholder={t('LabelSearch')}
          className="bg-bg-light border-border flex-1 rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? '...' : t('LabelSearch')}
        </button>
      </form>

      {/* Results */}
      {initialQuery && (
        <p className="text-foreground-muted mb-4 text-sm">
          {initialResults.length === 0
            ? `No results for "${initialQuery}"`
            : `${initialResults.length} result${initialResults.length !== 1 ? 's' : ''} for "${initialQuery}"`}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {initialResults.map((item: any) => {
          const coverSrc = item.cover_path
            ? `/api/items/${item.id}/cover?ts=${item.updated_at}`
            : placeholder
          const title = item.title || 'Unknown'
          const author = item.author_names_first_last || ''

          return (
            <Link
              key={item.id}
              href={`/library/${libraryId}/item/${item.id}`}
              className="group flex flex-col gap-1"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverSrc}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = placeholder }}
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
