---
name: aficionado-nextjs-proxy
description: Enforces the Next.js 16 Proxy Convention for Aficionado Web, avoiding the deprecated middleware.ts file.
---

# Next.js 16 Proxy Convention

In the `aficionado-web` project, we strictly enforce a unique architecture for route protection and Supabase session management. 

**CRITICAL RULE:** Never use `src/middleware.ts` or `src/utils/supabase/middleware.ts`. These are deprecated patterns in this codebase.

## The Proxy Pattern
All middleware logic, route protection, and Supabase session synchronization (e.g., AAL2 MFA checks) MUST be written directly in `src/proxy.ts`.

When building new protected routes or modifying session logic, always refer to `src/proxy.ts` and update it there. Do not create or restore new `middleware.ts` files, as the Next.js configuration is specifically designed to route requests through the Proxy first.

## Structure
`src/proxy.ts` exports an asynchronous `proxy` function and a `config` object containing the `matcher` array. All Supabase Server Client initializations and cookie updates should happen within the `proxy` function.
