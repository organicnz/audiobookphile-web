import { Author, AuthorImagePayload, AuthorQuickMatchPayload, AuthorResponse, AuthorUpdateResponse, BookSearchResult, Collection, CreateApiKeyPayload, CreateCustomMetadataProviderPayload, CreateCustomMetadataProviderResponse, CreateUpdateApiKeyResponse, FetchPodcastFeedResponse, FFProbeData, GetApiKeysResponse, GetAuthorsResponse, GetBackupsResponse, GetCollectionsResponse, GetCustomMetadataProvidersResponse, GetFilesystemPathsResponse, GetLibrariesResponse, GetLibraryItemsResponse, GetListeningSessionsResponse, GetLoggerDataResponse, GetNarratorsResponse, GetOpenListeningSessionsResponse, GetPlaylistsResponse, GetRssFeedsResponse, GetSeriesResponse, GetUsersResponse, Library, LibraryFilterData, LibraryItem, MediaItemShare, MetadataProvidersResponse, MutateBackupsResponse, OpenMediaItemSharePayload, OpenRssFeedPayload, OpenRssFeedResponse, PersonalizedShelf, Playlist, PlaylistItemPayload, PodcastSearchResult, RssPodcastEpisode, SaveLibraryOrderApiResponse, SearchLibraryResponse, Series, ServerStatus, TasksResponse, UpdateAuthorPayload, UpdateLibraryItemMediaPayload, UpdateLibraryItemMediaResponse, UploadCoverResponse, User, UserLoginResponse } from '@/types/api'
import { ApiError, NetworkError, UnauthorizedError } from '../apiErrors'
import { cache } from 'react'
import { apiRequest } from './client'

/**
 * Get FFProbe data for an audio file
 * Admin-only endpoint that returns raw ffprobe output
 * @param itemId - Library item ID
 * @param fileIno - Audio file inode
 * Returns: FFProbe data object
 */
export async function getAudioFileFFProbeData(itemId: string, fileIno: string): Promise<FFProbeData> {
  return apiRequest<FFProbeData>(`/api/items/${itemId}/ffprobe/${fileIno}`, {})
}

/**
 * Upload a cover image file for a library item
 * Returns: { success: true, cover: coverPath }
 */
export async function uploadCover(libraryItemId: string, file: File): Promise<UploadCoverResponse> {
  const formData = new FormData()
  formData.append('cover', file, file.name)

  return apiRequest<UploadCoverResponse>(`/api/items/${libraryItemId}/cover`, {
    method: 'POST',
    body: formData
  })
}

/**
 * Remove the current cover from a library item
 * Returns: 200 status with no body
 */
export async function removeCover(libraryItemId: string): Promise<void> {
  return apiRequest<void>(`/api/items/${libraryItemId}/cover`, {
    method: 'DELETE'
  })
}

/**
 * Delete a library file from a library item
 * Returns: 200 status with no body
 */
export async function deleteLibraryFile(libraryItemId: string, fileIno: string): Promise<void> {
  return apiRequest<void>(`/api/items/${libraryItemId}/file/${fileIno}`, {
    method: 'DELETE'
  })
}

/**
 * Update cover from a URL
 * Returns: { success: true, cover: coverPath }
 */
export async function updateCoverFromUrl(libraryItemId: string, coverUrl: string): Promise<UploadCoverResponse> {
  if (!coverUrl.startsWith('http:') && !coverUrl.startsWith('https:')) {
    throw new ApiError('Invalid URL', 400, 'Bad Request')
  }

  return apiRequest<UploadCoverResponse>(`/api/items/${libraryItemId}/cover`, {
    method: 'POST',
    body: JSON.stringify({ url: coverUrl })
  })
}

/**
 * Set cover from a local file in the library
 * Returns: { success: true, cover: coverPath }
 */
export async function setCoverFromLocalFile(libraryItemId: string, filePath: string): Promise<UploadCoverResponse> {
  return apiRequest<UploadCoverResponse>(`/api/items/${libraryItemId}/cover`, {
    method: 'PATCH',
    body: JSON.stringify({ cover: filePath })
  })
}

/**
 * Search library for books, authors, series, etc.
 * @param libraryId - The library to search
 * @param query - Search query string
 * @param limit - Maximum number of results per category (default 12)
 * Returns: Search results grouped by category (books, authors, series, etc.)
 */
export async function searchLibrary(libraryId: string, query: string, limit?: number): Promise<SearchLibraryResponse> {
  if (!query || !query.trim()) {
    throw new ApiError('Search query is required', 400, 'Bad Request')
  }

  const params = new URLSearchParams({ q: query.trim() })
  if (limit) {
    params.set('limit', limit.toString())
  }

  return await apiRequest<SearchLibraryResponse>(`/api/libraries/${libraryId}/search?${params.toString()}`, {})
}

export async function createCustomMetadataProvider(payload: CreateCustomMetadataProviderPayload): Promise<CreateCustomMetadataProviderResponse> {
  return apiRequest<CreateCustomMetadataProviderResponse>('/api/custom-metadata-providers', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

/** open an rss feed for library item, series or collection */
export async function openEntityRssFeed(
  entityType: 'item' | 'collection' | 'series',
  entityId: string,
  payload: OpenRssFeedPayload
): Promise<OpenRssFeedResponse> {
  return apiRequest<OpenRssFeedResponse>(`/api/feeds/${entityType}/${entityId}/open`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function openMediaItemShare(payload: OpenMediaItemSharePayload): Promise<MediaItemShare> {
  return apiRequest<MediaItemShare>('/api/share/mediaitem', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function closeMediaItemShare(shareId: string): Promise<void> {
  return apiRequest<void>(`/api/share/mediaitem/${shareId}`, {
    method: 'DELETE'
  })
}

export async function createBackup(): Promise<MutateBackupsResponse> {
  return apiRequest<MutateBackupsResponse>('/api/backups', {
    method: 'POST'
  })
}

export async function deleteBackup(backupId: string): Promise<MutateBackupsResponse> {
  return apiRequest<MutateBackupsResponse>(`/api/backups/${backupId}`, {
    method: 'DELETE'
  })
}

export async function applyBackup(backupId: string): Promise<void> {
  await apiRequest<void>(`/api/backups/${backupId}/apply`, {
    method: 'GET'
  })
}

export async function deleteListeningSession(sessionId: string): Promise<void> {
  return apiRequest<void>(`/api/sessions/${sessionId}`, {
    method: 'DELETE'
  })
}

export async function closeListeningSession(sessionId: string): Promise<void> {
  return apiRequest<void>(`/api/session/${sessionId}/close`, {
    method: 'POST'
  })
}

export async function batchDeleteListeningSessions(sessionIds: string[]): Promise<void> {
  return apiRequest<void>('/api/sessions/batch/delete', {
    method: 'POST',
    body: JSON.stringify({ sessions: sessionIds })
  })
}

/**
 * Search for books using a metadata provider
 * @param provider - The metadata provider to use (e.g., 'google', 'audible', etc.)
 * @param title - Book title to search for
 * @param author - Optional author name
 * @param libraryItemId - Optional library item ID for context
 * Returns: Array of book match results
 */
export async function searchBooks(provider: string, title: string, author?: string, libraryItemId?: string): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({
    provider,
    fallbackTitleOnly: '1',
    title: title.trim()
  })

  if (author) {
    params.set('author', author.trim())
  }

  if (libraryItemId) {
    params.set('id', libraryItemId)
  }

  return apiRequest<BookSearchResult[]>(`/api/search/books?${params.toString()}`, {})
}

/**
 * Search for podcasts
 * @param term - Search term or RSS feed URL
 * Returns: Array of podcast match results
 */
export async function searchPodcasts(term: string): Promise<PodcastSearchResult[]> {
  const params = new URLSearchParams({
    term: term.trim()
  })

  return apiRequest<PodcastSearchResult[]>(`/api/search/podcast?${params.toString()}`, {})
}

/**
 * Update library item media (metadata, tags, cover)
 * @param libraryItemId - Library item ID
 * @param updatePayload - Update payload with metadata, tags, and optionally url for cover
 * Returns: { updated: boolean, libraryItem?: LibraryItem }
 */
export async function updateLibraryItemMedia(libraryItemId: string, updatePayload: UpdateLibraryItemMediaPayload): Promise<UpdateLibraryItemMediaResponse> {
  return apiRequest<UpdateLibraryItemMediaResponse>(`/api/items/${libraryItemId}/media`, {
    method: 'PATCH',
    body: JSON.stringify(updatePayload)
  })
}

/**
 * Update media finished state for a library item (and optional episode)
 */
export async function updateMediaFinished(libraryItemId: string, payload: { isFinished: boolean; episodeId?: string }): Promise<void> {
  let endpoint = `/api/me/progress/${libraryItemId}`
  if (payload.episodeId) {
    endpoint += `/${payload.episodeId}`
  }

  return apiRequest<void>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify({ isFinished: payload.isFinished })
  })
}

/**
 * Batch update media finished state for multiple items or episodes
 */
export async function batchUpdateMediaFinished(payload: { libraryItemId: string; episodeId?: string; isFinished: boolean }[]): Promise<void> {
  return apiRequest<void>('/api/me/progress/batch/update', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

/**
 * Trigger a rescan for a library item
 */
export async function rescanLibraryItem(libraryItemId: string): Promise<{ result: 'UPDATED' | 'UPTODATE' | 'REMOVED' | null }> {
  return apiRequest<{ result: 'UPDATED' | 'UPTODATE' | 'REMOVED' | null }>(`/api/items/${libraryItemId}/scan`, {
    method: 'POST'
  })
}

/**
 * Send an ebook to a configured e-reader device
 */
export async function sendEbookToDevice(payload: { libraryItemId: string; deviceName: string }): Promise<void> {
  return apiRequest<void>('/api/emails/send-ebook-to-device', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

/**
 * Remove a series from the "continue listening" shelf
 */
export async function removeSeriesFromContinueListening(seriesId: string): Promise<void> {
  return apiRequest<void>(`/api/me/series/${seriesId}/remove-from-continue-listening`, {
    method: 'GET'
  })
}

/**
 * Remove a single progress entry from the continue listening/reading shelf
 */
export async function removeFromContinueListening(progressId: string): Promise<void> {
  return apiRequest<void>(`/api/me/progress/${progressId}/remove-from-continue-listening`, {
    method: 'GET'
  })
}

/**
 * Delete a library item, optionally deleting from the file system (hard delete)
 */
export async function deleteLibraryItem(libraryItemId: string, hardDelete: boolean): Promise<void> {
  const hard = hardDelete ? '1' : '0'
  return apiRequest<void>(`/api/items/${libraryItemId}?hard=${hard}`, {
    method: 'DELETE'
  })
}

/**
 * Delete an episode from a podcast library item.
 * @param hardDelete - If true, also deletes the audio file from the file system
 */
export async function deleteLibraryItemMediaEpisode(libraryItemId: string, episodeId: string, hardDelete = false): Promise<void> {
  const hard = hardDelete ? '?hard=1' : ''
  return apiRequest<void>(`/api/podcasts/${libraryItemId}/episode/${episodeId}${hard}`, {
    method: 'DELETE'
  })
}

/**
 * Fetch podcast feed using an RSS URL
 * @param rssFeed - RSS Feed URL
 */
export async function fetchPodcastFeed(rssFeed: string): Promise<FetchPodcastFeedResponse> {
  return apiRequest<FetchPodcastFeedResponse>(`/api/podcasts/feed`, {
    method: 'POST',
    body: JSON.stringify({ rssFeed })
  })
}

/**
 * Download selected podcast episodes
 * @param libraryItemId - Library item ID
 * @param episodes - Array of episodes to download
 */
export async function downloadPodcastEpisodes(libraryItemId: string, episodes: RssPodcastEpisode[]): Promise<void> {
  return apiRequest<void>(`/api/podcasts/${libraryItemId}/download-episodes`, {
    method: 'POST',
    body: JSON.stringify(episodes)
  })
}

/**
 * Clear queued podcast episode downloads for a library item.
 * @param libraryItemId - Library item ID
 */
export async function clearPodcastDownloadQueue(libraryItemId: string): Promise<void> {
  return apiRequest<void>(`/api/podcasts/${libraryItemId}/clear-queue`, {
    method: 'GET'
  })
}

/**
 * Quick embed metadata into audio files for a library item
 * @param libraryItemId - Library item ID
 * Returns: void (success) or throws error
 */
export async function embedMetadataQuick(libraryItemId: string): Promise<void> {
  return apiRequest<void>(`/api/tools/item/${libraryItemId}/embed-metadata`, {
    method: 'POST'
  })
}

/**
 * Get all tasks with optional queue data
 * Returns: Tasks array and queued task data
 */
export async function getTasks(): Promise<TasksResponse> {
  return apiRequest<TasksResponse>('/api/tasks?include=queue', {})
}

/**
 * Match all books in a library
 * @param libraryId - Library item ID
 * Returns: void (success) or throws error
 */
export async function matchAll(libraryId: string): Promise<void> {
  return apiRequest<void>(`/api/libraries/${libraryId}/matchall`, {
    method: 'GET'
  })
}

/**
 * Create a collection w/ initial book library item IDs
 */
export async function createCollection(payload: { libraryId: string; name: string; description?: string | null; books?: string[] }): Promise<Collection> {
  return apiRequest<Collection>('/api/collections', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

/**
 * Add a book library item to a collection
 */
export async function addBookToCollection(collectionId: string, libraryItemId: string): Promise<Collection> {
  return apiRequest<Collection>(`/api/collections/${collectionId}/book`, {
    method: 'POST',
    body: JSON.stringify({ id: libraryItemId })
  })
}

/**
 * Remove a book library item from a collection
 */
export async function removeBookFromCollection(collectionId: string, libraryItemId: string): Promise<Collection> {
  return apiRequest<Collection>(`/api/collections/${collectionId}/book/${libraryItemId}`, {
    method: 'DELETE'
  })
}

/**
 * Update a collection
 * @param collectionId - Collection ID
 * @param payload - Update payload with name and/or description
 * Returns: Updated collection
 */
export async function updateCollection(collectionId: string, payload: { name?: string; description?: string }): Promise<Collection> {
  return apiRequest<Collection>(`/api/collections/${collectionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

/**
 * Delete a collection
 * @param collectionId - Collection ID
 * Returns: void (success) or throws error
 */
export async function deleteCollection(collectionId: string): Promise<void> {
  return apiRequest<void>(`/api/collections/${collectionId}`, {
    method: 'DELETE'
  })
}

/**
 * Create a playlist from a collection
 * @param collectionId - Collection ID to create playlist from
 * Returns: The created playlist with id
 */
export async function createPlaylistFromCollection(collectionId: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/api/playlists/collection/${collectionId}`, {
    method: 'POST'
  })
}

/**
 * Delete a playlist
 * @param playlistId - Playlist ID to delete
 * Returns: void (success) or throws error
 */
export async function deletePlaylist(playlistId: string): Promise<void> {
  return apiRequest<void>(`/api/playlists/${playlistId}`, {
    method: 'DELETE'
  })
}

/**
 * Create a playlist w/ initial items
 */
export async function createPlaylist(payload: {
  libraryId: string
  name: string
  description?: string | null
  items?: PlaylistItemPayload[]
}): Promise<Playlist> {
  return apiRequest<Playlist>('/api/playlists', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

/**
 * Batch add items to a playlist
 */
export async function batchAddToPlaylist(playlistId: string, items: PlaylistItemPayload[]): Promise<Playlist> {
  return apiRequest<Playlist>(`/api/playlists/${playlistId}/batch/add`, {
    method: 'POST',
    body: JSON.stringify({ items })
  })
}

/**
 * Batch remove items from a playlist
 */
export async function batchRemoveFromPlaylist(playlistId: string, items: PlaylistItemPayload[]): Promise<Playlist> {
  return apiRequest<Playlist>(`/api/playlists/${playlistId}/batch/remove`, {
    method: 'POST',
    body: JSON.stringify({ items })
  })
}

/**
 * Match an author by ID
 * @param authorId - Author ID to match
 * @param payload - Quick match payload with provider and optional search data
 * Returns: Updated author response
 */
export async function quickMatchAuthor(authorId: string, payload: AuthorQuickMatchPayload): Promise<AuthorUpdateResponse> {
  return apiRequest<AuthorUpdateResponse>(`/api/authors/${authorId}/match`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

/**
 * Update an author
 * @param authorId - Author ID
 * @param payload - Update payload with author data
 * Returns: Updated author response
 */
export async function updateAuthor(authorId: string, payload: UpdateAuthorPayload): Promise<AuthorUpdateResponse> {
  return apiRequest<AuthorUpdateResponse>(`/api/authors/${authorId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

/**
 * Delete an author
 * @param authorId - Author ID to delete
 * Returns: void (success) or throws error
 */
export async function deleteAuthor(authorId: string): Promise<void> {
  return apiRequest<void>(`/api/authors/${authorId}`, {
    method: 'DELETE'
  })
}

/**
 * Get filesystem directories for folder browsing
 * Used by the folder chooser when creating/editing libraries
 * @param path - Directory path to list (empty string for root)
 * @param level - Depth level for the listing
 * Returns: { directories: Array<{ path, dirname, level }>, posix: boolean }
 */
export async function getFilesystemPaths(path: string, level: number): Promise<GetFilesystemPathsResponse> {
  return apiRequest(`/api/filesystem?path=${encodeURIComponent(path)}&level=${level}`)
}

/**
 * Upload a cover image file for an author
 * Returns: @AuthorResponse
 */
export async function submitAuthorImage(authorId: string, payload: AuthorImagePayload): Promise<AuthorResponse> {
  return apiRequest<AuthorResponse>(`/api/authors/${authorId}/image`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

/**
 * Remove the current cover image from an author
 * Returns: @AuthorResponse
 */
export async function removeAuthorImage(authorId: string): Promise<AuthorResponse> {
  return apiRequest<AuthorResponse>(`/api/authors/${authorId}/image`, {
    method: 'DELETE'
  })
}

/**
 * Get all available metadata search providers
 * Returns: Object with providers for books, book covers, and podcasts
 */
export const getMetadataProviders = cache(async (): Promise<MetadataProvidersResponse> => {
  return apiRequest<MetadataProvidersResponse>('/api/search/providers', {})
})

export const getTags = cache(async () => {
  return apiRequest<{ tags: string[] }>('/api/tags', {})
})

export const getGenres = cache(async () => {
  return apiRequest<{ genres: string[] }>('/api/genres', {})
})

export const getNarrators = cache(async (libraryId: string) => {
  return apiRequest<GetNarratorsResponse>(`/api/libraries/${libraryId}/narrators`, {})
})

export const getAuthor = cache(async (authorId: string, queryParams?: string): Promise<Author> => {
  return apiRequest<Author>(`/api/authors/${authorId}${queryParams ? `?${queryParams}` : ''}`, {})
})

export const getPlaylist = cache(async (playlistId: string): Promise<Playlist> => {
  return apiRequest<Playlist>(`/api/playlists/${playlistId}`, {})
})

export const getCollection = cache(async (collectionId: string): Promise<Collection> => {
  return apiRequest<Collection>(`/api/collections/${collectionId}?include=rssfeed`, {})
})

export const getSeries = cache(async (libraryId: string, seriesId: string): Promise<Series> => {
  return apiRequest<Series>(`/api/libraries/${libraryId}/series/${seriesId}?include=rssfeed`, {})
})

export const getRssFeeds = cache(async (): Promise<GetRssFeedsResponse> => {
  return apiRequest<GetRssFeedsResponse>('/api/feeds', {})
})

export const getCustomMetadataProviders = cache(async (): Promise<GetCustomMetadataProvidersResponse> => {
  return apiRequest<GetCustomMetadataProvidersResponse>('/api/custom-metadata-providers', {})
})

export const deleteCustomMetadataProvider = cache(async (providerId: string): Promise<void> => {
  return apiRequest<void>(`/api/custom-metadata-providers/${providerId}`, {
    method: 'DELETE'
  })
})

export const closeRssFeed = cache(async (feedId: string): Promise<void> => {
  return apiRequest<void>(`/api/feeds/${feedId}/close`, {
    method: 'POST'
  })
})

export const getBackups = cache(async (): Promise<GetBackupsResponse> => {
  return apiRequest<GetBackupsResponse>('/api/backups', {})
})

export const getListeningSessions = cache(async (queryParams?: string): Promise<GetListeningSessionsResponse> => {
  return apiRequest<GetListeningSessionsResponse>(`/api/sessions${queryParams ? `?${queryParams}` : ''}`, {})
})

export const getOpenListeningSessions = cache(async (): Promise<GetOpenListeningSessionsResponse> => {
  return apiRequest<GetOpenListeningSessionsResponse>('/api/sessions/open', {})
})

export const getLoggerData = cache(async (): Promise<GetLoggerDataResponse> => {
  return apiRequest<GetLoggerDataResponse>('/api/logger-data', {})
})

export async function updateNarrator(narratorId: string, payload: any): Promise<any> {
  return apiRequest<any>(`/api/narrators/${narratorId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

export async function deleteNarrator(narratorId: string): Promise<void> {
  return apiRequest<void>(`/api/narrators/${narratorId}`, {
    method: 'DELETE'
  })
}

export async function checkExistingBook(title: string, author: string, libraryId: string, mediaType: string): Promise<{ mediaId: string | null }> {
  const queryParams = new URLSearchParams()
  if (title) queryParams.append('title', title)
  if (author) queryParams.append('author', author)
  if (libraryId) queryParams.append('libraryId', libraryId)
  if (mediaType) queryParams.append('mediaType', mediaType)
  
  return apiRequest<{ mediaId: string | null }>(`/api/items/check-existing?${queryParams.toString()}`)
}
