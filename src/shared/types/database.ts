/**
 * Shared domain types for the Aficionado platform.
 * Maps 1:1 to the Supabase database schema.
 *
 * Convention: import from '@/shared/types/database' — never
 * create ad-hoc inline types that duplicate schema columns.
 */

// ──────────────────────────────────────────
// Discriminated union literals
// ──────────────────────────────────────────

export type UserType = 'aficionado' | 'fan'

export type ContentVisibility = 'public' | 'subscriber' | 'ppv'

export type ModerationStatus = 'approved' | 'pending_review' | 'rejected'

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled'

// ──────────────────────────────────────────
// Table row types
// ──────────────────────────────────────────

/** profiles table — extends auth.users */
export type Profile = {
  id: string
  created_at: string
  avatar_url: string | null
  bio: string | null
  goal: string | null
  strictness: string | null
  ai_tone: string | null
  user_type: UserType | null
  // Creator monetization columns
  username: string | null
  platform_fee_percent: number
  waitlist_goal_reached: boolean
}

/** content table — creator media (videos, paywalled content) */
export type Content = {
  id: string
  author_id: string
  title: string
  description: string | null
  mux_playback_id: string | null
  visibility: ContentVisibility
  required_tier: number
  price_ppv: number | null
  moderation_status: ModerationStatus
  nsfw_score: number
  boost_factor: number
  engagement_score: number
  created_at: string
}

/** subscriptions table — Stripe subscription sync */
export type Subscription = {
  id: string
  stripe_subscription_id: string
  fan_id: string
  creator_id: string
  status: SubscriptionStatus
  current_period_end: string
  created_at: string
}

/** creator_waitlists table — pre-launch waitlist signups */
export type WaitlistEntry = {
  id: string
  creator_id: string
  fan_email: string
  created_at: string
}

/** posts table — community wellness posts */
export type Post = {
  id: string
  created_at: string
  user_id: string
  circle_id: string | null
  content: string | null
  media_url: string | null
  requires_support: boolean
}

/** check_ins table — private wellness data */
export type CheckIn = {
  id: string
  created_at: string
  user_id: string
  mood: string | null
  urge_level: number | null
  journal: string | null
}

/** circles table */
export type Circle = {
  id: string
  created_at: string
  name: string
  description: string | null
  owner_id: string
}

// ──────────────────────────────────────────
// Composed query-result types
// ──────────────────────────────────────────

/** Content row joined with the author's profile (select subset) */
export type ContentWithProfile = Content & {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null
}

/** Post row joined with the author's profile (select subset) */
export type PostWithProfile = Post & {
  profiles: Pick<Profile, 'avatar_url' | 'ai_tone'> | null
}
