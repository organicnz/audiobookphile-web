# Database & Data Fetching

This document outlines our database conventions using Supabase.

## Supabase Schema
- We use PostgreSQL.
- Database schema and types should be strictly synced using the Supabase CLI (`supabase gen types typescript`).
- Ensure all tables have Row Level Security (RLS) enabled by default.

## Row Level Security (RLS)
- Authentication is tied to Supabase Auth.
- Write strict RLS policies to ensure users can only access or modify their own data, or data in circles they are members of.
- Bypassing RLS via the `service_role` key should only happen in secure Server Actions or Edge Functions, and only when absolutely necessary (e.g., admin tasks).

## Supabase Clients
We utilize multiple Supabase clients depending on the context:
1. **Server Client (`createServerClient`):** Used in Server Components, Server Actions, and API routes. Automatically handles cookie management for SSR.
2. **Browser Client (`createBrowserClient`):** Used in Client Components.

## Edge Functions
- Complex backend logic, such as AI-powered moderation or heavy background tasks, is handled by Supabase Edge Functions written in Deno.
