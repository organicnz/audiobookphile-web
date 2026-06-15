import { z } from 'zod'

export const LibrarySchema = z.object({
  id: z.string(),
  name: z.string(),
  displayOrder: z.number(),
  icon: z.string(),
  mediaType: z.enum(['book', 'podcast']),
  provider: z.string().optional(),
  lastScan: z.number().optional(),
  lastScanVersion: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number()
})

export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  imagePath: z.string().optional(),
  asin: z.string().optional(),
  libraryId: z.string().optional(),
  addedAt: z.number().optional(),
  updatedAt: z.number().optional(),
  numBooks: z.number().optional()
})

export const SeriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  sequence: z.string().optional(),
  nameIgnorePrefix: z.string().optional(),
  description: z.string().optional(),
  coverPath: z.string().optional(),
  libraryId: z.string().optional(),
  addedAt: z.number().optional(),
  updatedAt: z.number().optional()
})

export const CollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  libraryId: z.string(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional()
})

export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  libraryId: z.string(),
  userId: z.string(),
  lastUpdate: z.number().optional(),
  createdAt: z.number().optional()
})

export const MediaProgressSchema = z.object({
  id: z.string(),
  libraryItemId: z.string(),
  episodeId: z.string().optional(),
  displayTitle: z.string(),
  displaySubtitle: z.string().optional(),
  duration: z.number(),
  progress: z.number(),
  currentTime: z.number(),
  isFinished: z.boolean(),
  lastUpdate: z.number()
})

export const LibraryItemSchema = z.object({
  id: z.string(),
  ino: z.string(),
  libraryId: z.string(),
  path: z.string(),
  relPath: z.string(),
  isFile: z.boolean(),
  mtimeMs: z.number(),
  ctimeMs: z.number(),
  birthtimeMs: z.number(),
  addedAt: z.number(),
  updatedAt: z.number(),
  isMissing: z.boolean(),
  isInvalid: z.boolean(),
  mediaType: z.enum(['book', 'podcast']),
  media: z.any(), // Keeping it flexible for now as media structure is complex
  size: z.number().optional(),
  numFiles: z.number().optional(),
  userMediaProgress: MediaProgressSchema.optional()
})
