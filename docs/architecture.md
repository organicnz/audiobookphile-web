# Web App Architecture

This document outlines the high-level architecture of the Aficionado Web App.

## Next.js App Router
We utilize Next.js 16 with the App Router paradigm.
- **Server Components:** Used by default for all data fetching and SEO-critical pages. This minimizes JavaScript sent to the client and keeps Supabase queries secure on the server.
- **Client Components:** Opt-in via `"use client"` only for interactive UI elements (e.g., modals, form submissions).

## Data Fetching & Authentication
- **Supabase SSR:** Authentication is managed via `@supabase/ssr`. User sessions are stored in cookies and validated securely on the server before rendering protected routes.
- **Data Mutation:** We utilize Next.js Server Actions for all form submissions and database mutations. This ensures progressive enhancement and avoids exposing sensitive endpoints.

## State Management
- React 19's built-in hooks (`use`, `useActionState`, `useOptimistic`) are used for handling loading states and optimistic UI updates without relying on heavy external state management libraries.
