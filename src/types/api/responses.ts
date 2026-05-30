import { User } from "./auth"
import { Library, Author, LibraryItem, Series, Collection, Playlist } from '.'
import { ApiKey } from "./auth"
import { DirectoryEntry, RssFeed, MediaItemShare, PlaybackSession, ServerSettings, EReaderDevice, CustomMetadataProvider, Backup, BookLibraryItem, PodcastLibraryItem, MetadataProvider, Task, NarratorObject, LoggerDataLog, RssPodcast } from "./models"

export interface GetFilesystemPathsResponse {
  directories: DirectoryEntry[]
  posix: boolean
}

export interface GetLibrariesResponse {
  libraries: Library[]
}

export interface GetUsersResponse {
  users: User[]
}

export interface AuthorUpdateResponse {
  updated: boolean
  merged?: boolean
  author: Author
}

export interface AuthorResponse {
  author: Author
}

export interface GetLibraryItemsResponse {
  results: LibraryItem[]
  total?: number
  limit: number
  page: number
  sortBy?: string
  sortDesc: boolean
  filterBy?: string
  mediaType: string
  minified: boolean
  collapseseries: boolean
  include: string
  offset: number
}

export interface UploadCoverResponse {
  success: boolean
  cover: string
}

export interface GetRssFeedsResponse {
  feeds: RssFeed[]
}

/**
 * Response from the public share endpoint GET /public/share/:slug
 * Includes the playback session with audio tracks for the shared item
 */
export interface MediaItemShareResponse extends MediaItemShare {
  playbackSession: PlaybackSession
}

export interface UserLoginResponse {
  user: User
  userDefaultLibraryId?: string
  serverSettings: ServerSettings
  ereaderDevices: EReaderDevice[]
  /** e.g., 'local', 'docker' */
  Source: string
}

export interface GetApiKeysResponse {
  apiKeys: ApiKey[]
}

export interface CreateUpdateApiKeyResponse {
  apiKey: ApiKey
}

export interface GetCustomMetadataProvidersResponse {
  providers: CustomMetadataProvider[]
}

export interface CreateCustomMetadataProviderResponse {
  provider: CustomMetadataProvider
}

export interface GetBackupsResponse {
  backupLocation: string
  backupPathEnvSet: boolean
  backups: Backup[]
}

export interface MutateBackupsResponse {
  backups: Backup[]
}

export interface SearchLibraryResponse {
  book: Array<{ libraryItem: BookLibraryItem }>
  podcast: Array<{ libraryItem: PodcastLibraryItem }>
  narrators: Array<{ name: string; numBooks: number }>
  tags: Array<{ name: string; numItems: number }>
  genres: Array<{ name: string; numItems: number }>
  series: Array<{
    series: Series
    books: LibraryItem[]
  }>
  authors: Author[]
  episodes?: Array<{ libraryItem: PodcastLibraryItem }>
  /** Client-side filtered collections (not from server search API) */
  collections?: Collection[]
  /** Client-side filtered playlists (not from server search API) */
  playlists?: Playlist[]
}

export interface MetadataProvidersResponse {
  providers: {
    books: MetadataProvider[]
    booksCovers: MetadataProvider[]
    podcasts: MetadataProvider[]
  }
}

export interface UpdateLibraryItemMediaResponse {
  updated: boolean
  libraryItem?: LibraryItem
}

export interface TasksResponse {
  tasks: Task[]
  queuedTaskData?: {
    embedMetadata?: Array<{ libraryItemId: string }>
  }
}

export interface GetNarratorsResponse {
  narrators: NarratorObject[]
}

export interface GetAuthorsResponse {
  // When paginated (limit/page query params), uses 'results' instead of 'authors'
  authors?: Author[]
  results?: Author[]
  total?: number
  limit?: number
  page?: number
  sortBy?: string
  sortDesc?: boolean
  filterBy?: string
  minified?: boolean
  include?: string
}

export interface GetSeriesResponse {
  results: Series[]
  total: number
  limit: number
  page: number
  sortDesc: boolean
  minified: boolean
  include: string
}

export interface GetCollectionsResponse {
  results: Collection[]
  total: number
  limit: number
  page: number
  sortDesc: boolean
  minified: boolean
  include: string
}

export interface GetPlaylistsResponse {
  results: Playlist[]
  total: number
  limit: number
  page: number
}

export interface GetListeningSessionsResponse {
  total: number
  numPages: number
  page: number
  itemsPerPage: number
  sessions: PlaybackSession[]
  userId?: string
}

export interface GetOpenListeningSessionsResponse {
  sessions: PlaybackSession[]
  shareSessions: PlaybackSession[]
  /** Cover aspect ratio from library settings (included in share sessions) */
  coverAspectRatio?: 0 | 1
}

export interface GetLoggerDataResponse {
  currentDailyLogs: LoggerDataLog[]
}

export interface FetchPodcastFeedResponse {
  podcast: RssPodcast
}

export interface OpenRssFeedResponse {
  feed: RssFeed
}

export type SaveLibraryOrderApiResponse = {
  libraries: Library[]
}
