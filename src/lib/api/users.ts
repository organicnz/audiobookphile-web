import { Author, AuthorImagePayload, AuthorQuickMatchPayload, AuthorResponse, AuthorUpdateResponse, BookSearchResult, Collection, CreateApiKeyPayload, CreateCustomMetadataProviderPayload, CreateCustomMetadataProviderResponse, CreateUpdateApiKeyResponse, FetchPodcastFeedResponse, FFProbeData, GetApiKeysResponse, GetAuthorsResponse, GetBackupsResponse, GetCollectionsResponse, GetCustomMetadataProvidersResponse, GetFilesystemPathsResponse, GetLibrariesResponse, GetLibraryItemsResponse, GetListeningSessionsResponse, GetLoggerDataResponse, GetNarratorsResponse, GetOpenListeningSessionsResponse, GetPlaylistsResponse, GetRssFeedsResponse, GetSeriesResponse, GetUsersResponse, Library, LibraryFilterData, LibraryItem, MediaItemShare, MetadataProvidersResponse, MutateBackupsResponse, OpenMediaItemSharePayload, OpenRssFeedPayload, OpenRssFeedResponse, PersonalizedShelf, Playlist, PlaylistItemPayload, PodcastSearchResult, RssPodcastEpisode, SaveLibraryOrderApiResponse, SearchLibraryResponse, Series, ServerStatus, TasksResponse, UpdateAuthorPayload, UpdateLibraryItemMediaPayload, UpdateLibraryItemMediaResponse, UploadCoverResponse, User, UserLoginResponse } from '@/types/api'
import { ApiError, NetworkError, UnauthorizedError } from '../apiErrors'
import { cache } from 'react'
import { apiRequest } from './client'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createApiKey(payload: CreateApiKeyPayload): Promise<CreateUpdateApiKeyResponse> {
  return apiRequest<CreateUpdateApiKeyResponse>('/api/api-keys', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function updateApiKey(apiKeyId: string, payload: CreateApiKeyPayload): Promise<CreateUpdateApiKeyResponse> {
  return apiRequest<CreateUpdateApiKeyResponse>(`/api/api-keys/${apiKeyId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

/**
 * Batch multiple API requests and handle token refresh if needed.
 * If any request throws UnauthorizedError, redirects to the refresh endpoint.
 *
 * The function preserves the type of each promise, so:
 * const [user, libraries] = await getData(getCurrentUser(), getLibraries())
 * will correctly infer the type of 'user' and 'libraries'.
 */
export const getData = cache(async <T extends Promise<unknown>[]>(...promises: T): Promise<{ [K in keyof T]: Awaited<T[K]> }> => {
  try {
    const responses = await Promise.all(promises)
    return responses as { [K in keyof T]: Awaited<T[K]> }
  } catch (error) {
    // If any request is unauthorized, redirect to refresh token endpoint
    if (error instanceof UnauthorizedError) {
      const currentPath = (await headers()).get('x-current-path')
      return redirect(`/internal-api/refresh?redirect=${encodeURIComponent(currentPath || '')}`)
    }
    // Let other errors propagate (Next.js error boundaries will handle them)
    throw error
  }
})

/**
 * Current user response data
 *
 * call revalidateTag('current-user') when server settings change or user is updated
 */
export const getCurrentUser = cache(async (): Promise<UserLoginResponse> => {
  return apiRequest<UserLoginResponse>('/api/authorize', {
    method: 'POST',
    next: { tags: ['current-user'] }
  })
})

export const getServerStatus = cache(async (): Promise<ServerStatus> => {
  return apiRequest<ServerStatus>('/status')
})

export const getUsers = cache(async (queryParams?: string): Promise<GetUsersResponse> => {
  return apiRequest<GetUsersResponse>(`/api/users${queryParams ? `?${queryParams}` : ''}`, {})
})

export const getUser = cache(async (userId: string): Promise<User> => {
  return apiRequest<User>(`/api/users/${userId}`, {})
})

export const deleteUser = cache(async (userId: string): Promise<void> => {
  return apiRequest<void>(`/api/users/${userId}`, {
    method: 'DELETE'
  })
})

export const getApiKeys = cache(async (): Promise<GetApiKeysResponse> => {
  return apiRequest<GetApiKeysResponse>('/api/api-keys', {})
})

export const deleteApiKey = cache(async (apiKeyId: string): Promise<void> => {
  return apiRequest<void>(`/api/api-keys/${apiKeyId}`, {
    method: 'DELETE'
  })
})
