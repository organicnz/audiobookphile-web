import { useMediaContext } from '@/features/player/contexts/MediaContext'
import { useBookProviders, useMetadata } from '@/features/metadata/contexts/MetadataContext'
import { useUser } from '@/shared/contexts/UserContext'
import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { Library } from '@/types/api'

import { CleanedItem, FileWithMetadata, getItemsFromFilelist, upload, UploadProgressInfo } from './UploadHelper'
import { fetchBookMetadata, fetchPodcastMetadata, getCookie, checkExistingBook } from './actions'
import { sanitizeFileName, SupportedFileTypes } from '@/shared/lib/fileUtils'

export interface ItemToUpload extends CleanedItem {
  bookId?: string
  metadataError?: string
  isFetchingMetadata?: boolean
  isUploading?: boolean
  uploadProgress?: number
  uploadBytesLoaded?: number
  uploadBytesTotal?: number
  uploadError?: string
  uploadComplete?: boolean
  uploadFailed?: boolean
}

export function useUploader(libraries: Library[]) {
  const t = useTypeSafeTranslations()
  const { ensureProvidersLoaded } = useMetadata()
  const bookProviders = useBookProviders()
  const { lastCurrentLibraryId } = useMediaContext()
  const { userDefaultLibraryId } = useUser()

  useEffect(() => {
    ensureProvidersLoaded()
  }, [ensureProvidersLoaded])

  const [selectedLibrary, setSelectedLibrary] = useState<string>()
  const [autoFetch, setAutoFetch] = useState<boolean>(false)
  const [selectedProvider, setSelectedProvider] = useState<string>()
  const [uploadProcessing, setUploadProcessing] = useState<boolean>(false)
  const [uploadFinished, setUploadFinished] = useState<boolean>(false)
  const [uploadItems, setUploadItems] = useState<ItemToUpload[]>([])
  const [ignoredFiles, setIgnoredFiles] = useState<FileWithMetadata[]>([])
  const [errors, setErrors] = useState<string>('')
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})

  const libraryItems = libraries.map((lib) => ({
    value: lib.id,
    text: lib.name
  }))

  const currentLibraryMediaType = libraries.find((lib) => lib.id === selectedLibrary)?.mediaType

  useEffect(() => {
    if (libraries.length === 0) return
    if (selectedLibrary) return

    let defaultLibrary: Library | undefined
    if (lastCurrentLibraryId) {
      defaultLibrary = libraries.find((l) => l.id === lastCurrentLibraryId)
    }
    if (!defaultLibrary && userDefaultLibraryId) {
      defaultLibrary = libraries.find((l) => l.id === userDefaultLibraryId)
    }
    if (!defaultLibrary) {
      defaultLibrary = libraries[0]
    }

    setSelectedLibrary(defaultLibrary.id)
    setSelectedProvider(defaultLibrary.provider)
  }, [libraries, lastCurrentLibraryId, userDefaultLibraryId, selectedLibrary])

  const supFileTypes = useMemo(() => {
    let extensions: string[] = []
    Object.values(SupportedFileTypes).forEach((types) => {
      extensions = extensions.concat(types.map((t) => `.${t}`))
    })
    return extensions.join(', ')
  }, [])

  const handleFetchMetadata = async (itemIndex: number, itemsToUse: ItemToUpload[] = uploadItems) => {
    if (uploadProcessing) return

    const updatedItems = [...itemsToUse]
    const item = updatedItems[itemIndex]
    item.isFetchingMetadata = true
    setUploadItems(updatedItems)

    startTransition(async () => {
      try {
        if (currentLibraryMediaType === 'book') {
          const results = await fetchBookMetadata(item.title, item.author || '', selectedProvider || '')
          const bestCandidate = results[0]
          if (bestCandidate) {
            item.metadataError = undefined
            item.title = bestCandidate.title || item.title
            item.author = bestCandidate.author || item.author
            item.series = bestCandidate.series?.[0]?.series || ''
          } else {
            item.metadataError = t('ErrorUploadFetchMetadataNoResults')
          }
        } else if (currentLibraryMediaType === 'podcast') {
          const results = await fetchPodcastMetadata(item.title)
          const bestCandidate = results[0]
          if (bestCandidate) {
            item.metadataError = undefined
            item.title = bestCandidate.title || item.title
          } else {
            item.metadataError = t('ErrorUploadFetchMetadataNoResults')
          }
        }
      } catch {
        item.metadataError = t('ErrorUploadFetchMetadataAPI')
      } finally {
        item.isFetchingMetadata = false
        setUploadItems([...updatedItems])
      }
    })
  }

  function handleFilesDropped(files: File[]): void {
    const itemResults = getItemsFromFilelist(files as unknown as FileList, currentLibraryMediaType || 'book')
    setUploadItems(itemResults.items)
    setIgnoredFiles(itemResults.ignoredFiles)
    if (itemResults.items.length === 0) {
      setErrors('MessageNoItemsFound')
    }
    if (itemResults.items.length > 0 && autoFetch) {
      itemResults.items.forEach((_, index) => {
        handleFetchMetadata(index, itemResults.items)
      })
    }
  }

  function handleDialogFileSelected(files: FileList): void {
    const itemResults = getItemsFromFilelist(files, currentLibraryMediaType || 'book')
    setUploadItems(itemResults.items)
    setIgnoredFiles(itemResults.ignoredFiles)
    if (itemResults.items.length === 0) {
      setErrors('MessageNoItemsFound')
    }
    if (itemResults.items.length > 0 && autoFetch) {
      itemResults.items.forEach((_, index) => {
        handleFetchMetadata(index, itemResults.items)
      })
    }
  }

  function getDirectory(item: ItemToUpload): string {
    if (!item.title) return ''
    if (currentLibraryMediaType === 'podcast') return item.title
    const outputPathParts = [item.author, item.series, item.title]
    const cleanedOutputPathParts = outputPathParts.filter(Boolean).map((part) => sanitizeFileName(part ?? ''))
    return cleanedOutputPathParts.join('/')
  }

  function resetUpload(): void {
    setUploadItems([])
    setIgnoredFiles([])
    setErrors('')
    setUploadProcessing(false)
    setUploadFinished(false)
  }

  const handleItemPropertyChange = (itemIndex: number, property: keyof ItemToUpload, value: string) => {
    const updatedItems = [...uploadItems]
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [property]: value
    }
    setUploadItems(updatedItems)
  }

  const toggleTableExpanded = (itemIndex: number, tableType: 'itemFiles' | 'otherFiles' | 'ignoredFiles') => {
    const key = `${itemIndex}-${tableType}`
    setExpandedTables((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  function handleRemoveStagedItem(itemIndex: number): void {
    if (uploadProcessing || uploadItems[itemIndex]?.isUploading) return
    if (uploadItems.length === 1) {
      resetUpload()
      return
    }
    const updatedItems = [...uploadItems.filter((_, index) => index !== itemIndex)]
    setUploadItems(updatedItems)
  }

  const handleStartUpload = async () => {
    setUploadProcessing(true)
    setUploadFinished(false)
    const cookie = await getCookie()
    if (!cookie) {
      setErrors('ErrorUnauthorized')
      setUploadProcessing(false)
      return
    }

    const items = uploadItems.map((item) => ({ ...item }))
    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      try {
        const existingBookId = await checkExistingBook(item.title, item.author || '', selectedLibrary!, currentLibraryMediaType! || 'book')
        if (existingBookId) {
          item.bookId = existingBookId
        }
      } catch (err) {
        console.warn('Failed to check for existing book:', err)
      }

      item.isUploading = true
      item.uploadProgress = 0
      item.uploadBytesLoaded = 0
      item.uploadBytesTotal = item.itemFiles.reduce((sum, file) => sum + file.size, 0)
      setUploadItems([...items])

      try {
        await upload(item, selectedLibrary!, '', currentLibraryMediaType!, cookie, (progress: UploadProgressInfo) => {
          item.uploadProgress = progress.percent
          item.uploadBytesLoaded = progress.loaded
          item.uploadBytesTotal = progress.total
          setUploadItems([...items])
        })
        item.uploadFailed = false
      } catch (error) {
        console.error('Upload failed:', error)
        item.uploadFailed = true
        item.uploadError = error instanceof Error ? error.message : 'Upload failed'
      } finally {
        item.isUploading = false
        item.uploadComplete = !item.uploadFailed
        setUploadItems([...items])
      }
    }

    setUploadProcessing(false)
    setUploadFinished(true)
  }

  return {
    t,
    bookProviders,
    selectedLibrary,
    setSelectedLibrary,
    autoFetch,
    setAutoFetch,
    selectedProvider,
    setSelectedProvider,
    uploadProcessing,
    uploadFinished,
    uploadItems,
    ignoredFiles,
    errors,
    expandedTables,
    libraryItems,
    currentLibraryMediaType,
    supFileTypes,
    handleFilesDropped,
    handleDialogFileSelected,
    getDirectory,
    resetUpload,
    handleItemPropertyChange,
    toggleTableExpanded,
    handleFetchMetadata,
    handleRemoveStagedItem,
    handleStartUpload
  }
}
