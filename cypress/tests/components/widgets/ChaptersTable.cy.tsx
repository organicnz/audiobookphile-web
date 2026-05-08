import ChaptersTable from '@/components/widgets/ChaptersTable'
import { UserContext, type AppUser, type UserContextType } from '@/contexts/UserContext'
import { BookLibraryItem } from '@/types/api'
import type { Profile } from '@/types/index'

const mockProfile: Profile = {
  id: 'root',
  username: 'admin',
  user_type: 'admin',
  language: 'en-us',
  theme: 'dark',
  default_library_id: 'test-library-id',
  created_at: null,
  updated_at: null
}

const mockUser: AppUser = {
  id: 'root',
  email: 'admin@example.com',
  username: 'admin',
  userType: 'admin',
  language: 'en-us',
  theme: 'dark',
  defaultLibraryId: 'test-library-id',
  type: 'admin',
  permissions: {
    download: true, update: true, delete: true, upload: true,
    createEreader: true, accessAllLibraries: true, accessAllTags: true,
    accessExplicitContent: true, selectedTagsNotAccessible: false
  },
  mediaProgress: [],
  bookmarks: [],
  isActive: true,
  isLocked: false,
  librariesAccessible: [],
  itemTagsSelected: [],
  hasOpenIDLink: false,
  token: ''
}

const mockUserContextValue: UserContextType = {
  user: mockUser,
  profile: mockProfile,
  userIsAdmin: true,
  userCanUpdate: true,
  userCanDelete: true,
  userCanDownload: true,
  userIsAdminOrUp: true,
  serverSettings: {},
  userDefaultLibraryId: 'test-library-id',
  ereaderDevices: [],
  Source: 'test',
  getMediaItemProgress: () => undefined
}

const mockLibraryItem: BookLibraryItem = {
  id: 'test-item-id',
  ino: '123',
  libraryId: 'test-library-id',
  folderId: 'test-folder-id',
  path: '/path/to/book',
  relPath: 'book',
  isFile: false,
  mtimeMs: 1234567890,
  ctimeMs: 1234567890,
  birthtimeMs: 1234567890,
  addedAt: 1234567890,
  updatedAt: 1234567890,
  lastScan: 1234567890,
  scanVersion: '1',
  isMissing: false,
  isInvalid: false,
  mediaType: 'book',
  media: {
    id: 'test-media-id',
    libraryItemId: 'test-item-id',
    metadata: {
      title: 'Test Book Title',
      authorName: 'Test Author',
      authors: [],
      narrators: [],
      series: [],
      genres: [],
      explicit: false
    },
    coverPath: '',
    tags: [],
    audioFiles: [],
    chapters: [],
    duration: 120,
    size: 1000,
    tracks: [],
    ebookFile: undefined
  },
  libraryFiles: []
}

describe('ChaptersTable', () => {
  it('renders correctly', () => {
    cy.viewport(1024, 768)

    const libraryItem = { ...mockLibraryItem }
    libraryItem.media.chapters = [
      { id: 1, start: 0, end: 60, title: 'Chapter 1' },
      { id: 2, start: 60, end: 120, title: 'Chapter 2' }
    ]

    cy.mount(
      <UserContext.Provider value={mockUserContextValue}>
        <ChaptersTable libraryItem={libraryItem} expanded />
      </UserContext.Provider>
    )

    cy.get('table').should('exist')
    cy.contains('Chapter 1').should('be.visible')
    cy.contains('Chapter 2').should('be.visible')
    cy.contains('00:00').should('be.visible')
    cy.contains('01:00').should('be.visible')
  })

  it('hides Duration column below md breakpoint', () => {
    const libraryItem = { ...mockLibraryItem }
    libraryItem.media.chapters = [{ id: 1, start: 0, end: 60, title: 'Chapter 1' }]

    cy.mount(
      <UserContext.Provider value={mockUserContextValue}>
        <ChaptersTable libraryItem={libraryItem} expanded />
      </UserContext.Provider>
    )

    cy.viewport(375, 667)
    cy.contains('th', 'Duration').should('have.class', 'hidden')

    cy.viewport(768, 1024)
    cy.contains('th', 'Duration').should('be.visible')
  })
})
