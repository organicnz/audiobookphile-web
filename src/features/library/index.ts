/**
 * Library Feature — barrel export.
 */

// Components
export { default as BookShelfGrid } from './components/BookShelfGrid'
export { default as BookShelfRow } from './components/BookShelfRow'
export { default as LibraryFilesTable } from './components/LibraryFilesTable'
export { LibraryStatsDashboard } from './components/LibraryStatsDashboard'

// Contexts
export { LibraryProvider, useLibrary, useLibraryOptional, useBookCoverAspectRatio } from './contexts/LibraryContext'
export { CardSizeProvider, useCardSize } from './contexts/CardSizeContext'

// Hooks
export { useBookshelfData } from './hooks/useBookshelfData'
export { useLibrariesQuery } from './hooks/useLibrariesQuery'
export { useLibrarySearch } from './hooks/useLibrarySearch'
export { useInfiniteBookshelf } from './hooks/useInfiniteBookshelf'
export { useFilterData } from './hooks/useFilterData'
export { useBookshelfQuery } from './hooks/useBookshelfQuery'
export { useBookshelfUpdater } from './hooks/useBookshelfUpdater'
export { useBookshelfVirtualizer } from './hooks/useBookshelfVirtualizer'
export { useLibraryStats } from './hooks/useLibraryStats'
export { useLibraryFileActions } from './hooks/useLibraryFileActions'
export { useItemPageSocket } from './hooks/useItemPageSocket'
export { useGlobalSearchTransformer } from './hooks/useGlobalSearchTransformer'

// Actions
export * from './actions/libraryActions'
export * from './actions/searchActions'
export * from './actions/collectionActions'
export * from './actions/playlistActions'
