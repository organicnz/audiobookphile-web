/**
 * Metadata Feature — barrel export.
 */

// Components
export { default as PreviewCover } from './components/PreviewCover'
export { default as AuthorImage } from './components/AuthorImage'
export { default as Match } from './components/Match'
export { default as CoverEdit } from './components/CoverEdit'

// Contexts
export { MetadataProvider, useMetadata, useBookProviders, usePodcastProviders } from './contexts/MetadataContext'

// Hooks
export { useAuthorActions } from './hooks/useAuthorActions'
export { useDetailsEdit } from './hooks/useDetailsEdit'
