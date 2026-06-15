import { Author, AuthorImagePayload, AuthorQuickMatchPayload, AuthorResponse, AuthorUpdateResponse, BookSearchResult, Collection, CreateApiKeyPayload, CreateCustomMetadataProviderPayload, CreateCustomMetadataProviderResponse, CreateUpdateApiKeyResponse, FetchPodcastFeedResponse, FFProbeData, GetApiKeysResponse, GetAuthorsResponse, GetBackupsResponse, GetCollectionsResponse, GetCustomMetadataProvidersResponse, GetFilesystemPathsResponse, GetLibrariesResponse, GetLibraryItemsResponse, GetListeningSessionsResponse, GetLoggerDataResponse, GetNarratorsResponse, GetOpenListeningSessionsResponse, GetPlaylistsResponse, GetRssFeedsResponse, GetSeriesResponse, GetUsersResponse, Library, LibraryFilterData, LibraryItem, MediaItemShare, MetadataProvidersResponse, MutateBackupsResponse, OpenMediaItemSharePayload, OpenRssFeedPayload, OpenRssFeedResponse, PersonalizedShelf, Playlist, PlaylistItemPayload, PodcastSearchResult, RssPodcastEpisode, SaveLibraryOrderApiResponse, SearchLibraryResponse, Series, ServerStatus, TasksResponse, UpdateAuthorPayload, UpdateLibraryItemMediaPayload, UpdateLibraryItemMediaResponse, UploadCoverResponse, User, UserLoginResponse } from '@/types/api'
import { ApiError, NetworkError, UnauthorizedError } from '../apiErrors'
import { cache } from 'react'
import { apiRequest } from './client'

export async function changePassword(newPassword: string): Promise<void> {
  return apiRequest<void>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  })
}

