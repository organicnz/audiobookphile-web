'use client'

import { getFilesystemPaths } from '@/app/(main)/settings/libraries/actions'
import Btn from '@/components/ui/Btn'
import LoadingSpinner from '@/components/widgets/LoadingSpinner'
import { useGlobalToast } from '@/contexts/ToastContext'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/lib/merge-classes'
import { ArrowLeft, Folder, ChevronRight, ExternalLink } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface DirectoryEntry {
  path: string
  dirname: string
  level: number
}

interface DirectoryEntryDisplay extends DirectoryEntry {
  isUsed: boolean
  isSelected: boolean
  className: string
}

interface LibraryFolderChooserProps {
  /** Already-assigned folder paths (will be marked as unavailable) */
  paths: string[]
  /** Called when user selects a folder path */
  onSelect: (path: string) => void
  /** Called when user clicks the back arrow to dismiss the chooser */
  onBack: () => void
}

export default function LibraryFolderChooser({ paths, onSelect, onBack }: LibraryFolderChooserProps) {
  const t = useTypeSafeTranslations()
  const { showToast } = useGlobalToast()

  const [initialLoad, setInitialLoad] = useState(false)
  const [loadingDirs, setLoadingDirs] = useState(false)
  const [isPosix, setIsPosix] = useState(true)
  const [rootDirs, setRootDirs] = useState<DirectoryEntry[]>([])
  const [directories, setDirectories] = useState<DirectoryEntry[]>([])
  const [selectedPath, setSelectedPath] = useState('')
  const [subdirs, setSubdirs] = useState<DirectoryEntry[]>([])
  const [level, setLevel] = useState(0)

  // Fetch directories via server action
  const fetchDirs = useCallback(
    async (path: string, dirLevel: number): Promise<DirectoryEntry[]> => {
      setLoadingDirs(true)
      try {
        const data = await getFilesystemPaths(path, dirLevel)
        setIsPosix(!!data.posix)
        return data.directories || []
      } catch (error) {
        console.error('Failed to get filesystem paths', error)
        showToast(t('ToastFailedToLoadData'), { type: 'error' })
        return []
      } finally {
        setLoadingDirs(false)
      }
    },
    [showToast, t]
  )

  // Initialize on mount
  useEffect(() => {
    let cancelled = false

    async function init() {
      setInitialLoad(true)
      const dirs = await fetchDirs('', 0)
      if (cancelled) return
      setInitialLoad(false)
      setRootDirs(dirs)
      setDirectories(dirs)
      setSubdirs([])
      setSelectedPath('')
    }

    init()
    return () => {
      cancelled = true
    }
  }, [fetchDirs])

  // Compute display directories with used/selected styling
  const displayDirectories: DirectoryEntryDisplay[] = directories.map((d) => {
    const isUsed = paths.some((p) => p.endsWith(d.path))
    const isSelected = d.path === selectedPath
    const classes: string[] = []
    if (isSelected) classes.push('bg-white/10')
    if (isUsed) classes.push('bg-error/20')
    return { ...d, isUsed, isSelected, className: classes.join(' ') }
  })

  const displaySubdirs: DirectoryEntryDisplay[] = subdirs.map((d) => {
    const isUsed = paths.some((p) => p.endsWith(d.path))
    const classes: string[] = []
    if (isUsed) classes.push('bg-error/20')
    return { ...d, isUsed, isSelected: false, className: classes.join(' ') }
  })

  // Go back one level
  const goBack = useCallback(async () => {
    const selPath = selectedPath.replace(/^\//, '')
    const splitPaths = selPath.split('/')

    let lookupPath = ''
    let previousPath = ''

    if (splitPaths.length > 2) {
      lookupPath = splitPaths.slice(0, -2).join('/')
    }
    previousPath = splitPaths.slice(0, -1).join('/')

    if (!isPosix) {
      // For windows drives add a trailing slash, e.g. C:/
      if (lookupPath.endsWith(':')) {
        lookupPath += '/'
      }
      if (previousPath.endsWith(':')) {
        previousPath += '/'
      }
    } else {
      // Add leading slash for posix
      if (previousPath) previousPath = '/' + previousPath
      if (lookupPath) lookupPath = '/' + lookupPath
    }

    setLevel((prev) => prev - 1)
    setSubdirs(directories)
    setSelectedPath(previousPath)

    const newDirs = await fetchDirs(lookupPath, level - 1)
    setDirectories(newDirs)
  }, [selectedPath, isPosix, directories, level, fetchDirs])

  // Select a directory in the left column
  const selectDir = useCallback(
    async (dir: DirectoryEntryDisplay) => {
      if (dir.isUsed) return
      setSelectedPath(dir.path)
      setLevel(dir.level)
      const newSubdirs = await fetchDirs(dir.path, dir.level + 1)
      setSubdirs(newSubdirs)
    },
    [fetchDirs]
  )

  // Select a subdirectory in the right column
  const selectSubDir = useCallback(
    async (dir: DirectoryEntryDisplay) => {
      if (dir.isUsed) return
      setSelectedPath(dir.path)
      setLevel(dir.level)
      setDirectories(subdirs)
      const newSubdirs = await fetchDirs(dir.path, dir.level + 1)
      setSubdirs(newSubdirs)
    },
    [fetchDirs, subdirs]
  )

  // Confirm folder selection
  const selectFolder = useCallback(() => {
    if (!selectedPath) {
      console.error('No selected path')
      return
    }
    // Prevent selecting a parent directory of a folder already added
    if (paths.some((p) => p.startsWith(selectedPath))) {
      showToast('Cannot add a parent directory of a folder already added', { type: 'error' })
      return
    }
    onSelect(selectedPath)
  }, [selectedPath, paths, onSelect, showToast])

  return (
    <div className="bg-bg/80 backdrop-blur-xl absolute inset-0 z-10 flex flex-col px-4 py-4 rounded-2xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="mb-4 flex items-center py-2 px-2">
        <button type="button" onClick={onBack} className="text-white/40 hover:text-white cursor-pointer transition-colors p-2 rounded-xl hover:bg-white/5">
          <ArrowLeft size={28} />
        </button>
        <p className="px-4 text-xl font-bold uppercase tracking-widest text-white/90">{t('HeaderChooseAFolder')}</p>
      </div>

      {/* Selected path display */}
      {rootDirs.length > 0 && (
        <div className="bg-white/5 border border-white/5 mb-2 w-full rounded-lg px-4 py-2">
          <p className="truncate font-mono text-sm text-white/70">{selectedPath || '/'}</p>
        </div>
      )}

      {/* Directory browser */}
      {rootDirs.length > 0 ? (
        <div className="bg-black/20 border border-white/5 relative flex min-h-0 flex-1 rounded-xl p-4 gap-4">
          {/* Left column: current directories */}
          <div className="border-white/10 h-full w-1/2 overflow-y-auto border-r pr-4">
            {level > 0 && (
              <button type="button" className="hover:bg-white/10 flex w-full cursor-pointer items-center p-2 rounded-lg text-start transition-colors" onClick={goBack}>
                <Folder size={18} className="text-amber-400/80" />
                <p className="px-3 font-mono text-sm text-white/60">..</p>
              </button>
            )}
            {displayDirectories.map((dir) => (
              <button
                type="button"
                key={dir.path}
                className={mergeClasses(
                  'hover:text-white text-white/60 hover:bg-white/10 flex w-full cursor-pointer items-center p-2 rounded-lg text-start transition-all',
                  dir.className,
                  dir.isUsed && 'cursor-not-allowed opacity-30 grayscale'
                )}
                onClick={() => selectDir(dir)}
                disabled={dir.isUsed}
              >
                <Folder size={18} className="text-amber-400/80 shrink-0" />
                <p className="truncate px-3 font-mono text-sm">{dir.dirname}</p>
                {dir.isSelected && (
                  <ChevronRight size={16} className="text-white shrink-0 ml-auto" />
                )}
              </button>
            ))}
          </div>

          {/* Right column: subdirectories */}
          <div className="h-full w-1/2 overflow-y-auto">
            {displaySubdirs.map((dir) => (
              <button
                type="button"
                key={dir.path}
                className={mergeClasses(
                  'hover:text-white text-white/60 hover:bg-white/10 flex w-full cursor-pointer items-center p-2 rounded-lg text-start transition-all',
                  dir.className,
                  dir.isUsed && 'cursor-not-allowed opacity-30 grayscale'
                )}
                onClick={() => selectSubDir(dir)}
                disabled={dir.isUsed}
              >
                <Folder size={18} className="text-amber-400/80 fill-amber-400/20 shrink-0" />
                <p className="truncate px-3 font-mono text-sm">{dir.dirname}</p>
              </button>
            ))}
          </div>

          {/* Loading overlay */}
          {loadingDirs && (
            <div className="bg-primary/30 absolute inset-0 flex items-center justify-center rounded">
              <LoadingSpinner />
            </div>
          )}
        </div>
      ) : initialLoad ? (
        <div className="flex-1 py-12 text-center">
          <p>{t('MessageLoadingFolders')}</p>
        </div>
      ) : (
        <div className="mx-auto max-w-sm flex-1 py-12 text-center">
          <p className="mb-2 text-lg">{t('MessageNoFoldersAvailable')}</p>
          <p className="text-foreground-muted mb-2">{t('NoteFolderPicker')}</p>
        </div>
      )}

      {/* Select folder button */}
      <div className="w-full shrink-0 py-2">
        <Btn color="bg-primary" disabled={!selectedPath} className="mt-2 w-full" onClick={selectFolder}>
          {t('ButtonSelectFolderPath')}
        </Btn>
      </div>
    </div>
  )
}
