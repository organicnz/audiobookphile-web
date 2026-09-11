/**
 * Shared validation utilities for frontend input sanitization and validation.
 *
 * This module provides:
 * - XSS protection through input sanitization
 * - Length validation helpers
 * - Common validation patterns
 * - Type-safe validation with Zod
 */

import { z } from 'zod'

/**
 * Maximum lengths for common fields (matches backend validation).
 */
export const MAX_LENGTHS = {
  TITLE: 256,
  AUTHOR: 300,
  DESCRIPTION: 4096,
  USERNAME: 64,
  EMAIL: 320,
  PASSWORD: 128,
  SEARCH_QUERY: 256,
  URL: 2048
} as const

/**
 * Sanitize a string to prevent XSS attacks.
 * Removes control characters and normalizes whitespace.
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/<[^>]*>/g, '') // Remove HTML tags
}

/**
 * Sanitize HTML content for safe rendering.
 * Use DOMPurify for actual HTML sanitization in components.
 */
export function sanitizeHTML(html: string): string {
  // Basic sanitization - use DOMPurify for production
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

/**
 * Validate and sanitize user input.
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues.map((err) => {
      const field = err.path.join('.') || 'input'
      return `${field}: ${err.message}`
    })
    return { success: false, errors }
  }

  return { success: true, data: result.data }
}

/**
 * Common validation schemas for frontend forms.
 */
export const CommonSchemas = {
  // Auth
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(MAX_LENGTHS.USERNAME)
    .regex(/^[\w-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),

  email: z.string().email('Invalid email address').max(MAX_LENGTHS.EMAIL),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(MAX_LENGTHS.PASSWORD)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  // Content
  title: z.string().min(1).max(MAX_LENGTHS.TITLE),

  author: z.string().min(1).max(MAX_LENGTHS.AUTHOR),

  description: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),

  // Search
  searchQuery: z.string().min(1).max(MAX_LENGTHS.SEARCH_QUERY),

  // IDs
  uuid: z.string().uuid('Invalid ID format'),

  // URLs
  url: z.string().url('Invalid URL').max(MAX_LENGTHS.URL)
} as const

/**
 * Form validation helper for React Hook Form integration.
 */
export function createValidator<T extends z.ZodSchema>(schema: T) {
  return (data: unknown) => {
    const result = schema.safeParse(data)
    if (result.success) {
      return {}
    }
    // Convert Zod errors to React Hook Form format
    return result.error.issues.reduce(
      (acc: Record<string, string>, err) => {
        const field = err.path.join('.')
        acc[field] = err.message
        return acc
      },
      {} as Record<string, string>
    )
  }
}

/**
 * Debounce validation for async validation.
 */
export function debounceValidation<T>(validate: (value: T) => Promise<string | undefined>, delay: number): (value: T) => Promise<string | undefined> {
  let timeoutId: NodeJS.Timeout | null = null

  return (value: T) => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(async () => {
        const error = await validate(value)
        resolve(error)
      }, delay)
    })
  }
}

/**
 * Input length limiter for text inputs.
 */
export function limitLength(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength)
}
