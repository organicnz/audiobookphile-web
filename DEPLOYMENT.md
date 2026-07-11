# Deployment Operations Guide

This document covers the environment variables required to deploy `audiobookphile-web` on Vercel, explains naming quirks, and provides troubleshooting steps for common deployment failures.

---

## 1. Environment Variable Reference

Variables are grouped by the Vercel environment in which they are required. "Build-time" variables (prefixed `NEXT_PUBLIC_`) are inlined into the browser bundle at compile time and must be present in every environment that triggers a build.

### Build-time variables

| Variable | Production | Preview | Development | Purpose | Consequence if absent |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Required | Required | Supabase project URL (e.g. `https://xyz.supabase.co`). Also used in `next.config.ts` to build the `/api/*` rewrite destination. | All Supabase client calls fail. The `/api/*` rewrites resolve to `undefined/functions/v1/api/*`, breaking every API route with 502/404 errors. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Required | Required | Public anonymous key for the Supabase browser client. Safe to expose to the browser. | The Supabase client cannot initialise; all auth and database queries fail. |
| `NEXT_PUBLIC_SITE_URL` | Required | Required | Required | Canonical public URL of the deployment — no trailing slash (e.g. `https://audiobookphile.com`). Used for OAuth redirect URLs and auth email links. | Auth callbacks and email confirmation/magic-link/password-reset links redirect to the wrong origin, breaking sign-in and sign-up flows. Falls back to `NEXT_PUBLIC_VERCEL_URL` / `VERCEL_URL`, which produces mismatched redirect URLs on Preview deployments. |
| `NEXT_PUBLIC_POSTHOG_KEY` | Required | Optional | Optional | PostHog analytics project API key (format: `phc_...`). | PostHog initialises with the placeholder value `phc_placeholder` so the app does not crash, but no real analytics events are captured. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Required if PostHog key is set | Optional | Optional | PostHog ingestion host. Defaults to `https://us.i.posthog.com` when absent. Change this if you use a custom PostHog domain or the EU cloud region. | Analytics events are sent to the default US PostHog endpoint, which may be incorrect for custom or EU-region setups. |

### Server-side variables

| Variable | Production | Preview | Development | Purpose | Consequence if absent |
| --- | --- | --- | --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Required | Required for admin operations | Canonical service role key for server-side Supabase admin operations. Bypasses Row Level Security entirely. See [§2](#2-supabase_service_role_key-vs-supabase_service_key) for the alias. | `createServiceRoleClient()` throws `Missing environment variable: SUPABASE_SERVICE_ROLE_KEY` and all server-side admin operations fail with a 500 error. |
| `SUPABASE_SERVICE_KEY` | — | — | — | Legacy alias for `SUPABASE_SERVICE_ROLE_KEY`. Accepted as a fallback during a rename transition. Prefer the canonical name for all new configurations. | If this is the only name set, the fallback in `service-role.ts` keeps things working, but any future removal of that fallback would silently break the app. |

### Storage — Backblaze B2 (optional group)

All five variables below are optional as a group. When any of them is absent the storage sync code automatically falls back to Supabase storage without crashing (graceful degradation via optional chaining in `storageSync.ts`). Set them only in environments where B2 sync is intended.

| Variable | Environments | Purpose | Consequence if absent |
| --- | --- | --- | --- |
| `B2_ENDPOINT` | Prod / Preview / Dev — optional | S3-compatible endpoint for the B2 bucket (e.g. `https://s3.us-west-004.backblazeb2.com`). | Storage sync falls back to Supabase storage. |
| `B2_BUCKET_NAME` | Prod / Preview / Dev — optional | Name of the B2 bucket that holds audiobook files. | Storage sync falls back to Supabase storage. |
| `B2_KEY_ID` | Prod / Preview / Dev — optional | B2 key ID (analogous to `AWS_ACCESS_KEY_ID`). | Storage sync falls back to Supabase storage. |
| `B2_APP_KEY` | Prod / Preview / Dev — optional | B2 application key (analogous to `AWS_SECRET_ACCESS_KEY`). | Storage sync falls back to Supabase storage. |
| `B2_REGION` | Prod / Preview / Dev — optional | B2 region string used to construct the S3-compatible endpoint. Defaults to `us-west-004`. | The default region is used; change only if your bucket is in a different region. |

---

## 2. `SUPABASE_SERVICE_ROLE_KEY` vs `SUPABASE_SERVICE_KEY`

### Background

When this project was first configured in the Vercel dashboard the service role key was stored as `SUPABASE_SERVICE_KEY` — a shorter, informal name. The codebase has since standardised on the canonical Supabase name `SUPABASE_SERVICE_ROLE_KEY`. To avoid breaking existing deployments during the transition, `service-role.ts` accepts either name via a nullish-coalescing fallback:

```ts
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
```

Both variable names are therefore intentionally supported. For any new Vercel project or environment configuration, always use `SUPABASE_SERVICE_ROLE_KEY`.

### Migrating from `SUPABASE_SERVICE_KEY` to `SUPABASE_SERVICE_ROLE_KEY`

1. In the Vercel dashboard, open **Settings → Environment Variables** for the project.
2. Add a new variable named `SUPABASE_SERVICE_ROLE_KEY` with the same value as the existing `SUPABASE_SERVICE_KEY`. Apply it to all environments where the old variable was set (Production, Preview, and/or Development).
3. Trigger a new deployment (redeploy or push a commit) and verify that server-side admin operations — uploads, user management, etc. — still work correctly.
4. Once you have confirmed the app is healthy, you may optionally delete the old `SUPABASE_SERVICE_KEY` variable from the Vercel dashboard.

> **Security note:** The service role key bypasses Row Level Security entirely. Never prefix it with `NEXT_PUBLIC_`, never commit it to source control, and never expose it in client-side code.

---

## 3. `NEXT_PUBLIC_SITE_URL` and Supabase Auth

### Why this variable matters for auth

The auth callback route (`src/app/callback/route.ts`) uses the `x-forwarded-host` header as a fallback, which is sufficient to redirect the browser correctly after an OAuth code exchange on Vercel Preview deployments. However, Supabase Auth generates email confirmation links, magic links, and password-reset URLs **server-side**, using the "Site URL" configured in the Supabase Auth dashboard — not any value from the Next.js code. If `NEXT_PUBLIC_SITE_URL` in Vercel does not match the Supabase Auth "Site URL" setting, those server-generated links will point to the wrong domain and auth flows will break.

### Required configuration

#### In the Vercel dashboard

1. Open **Settings → Environment Variables**.
2. Set `NEXT_PUBLIC_SITE_URL` to the canonical URL for each environment:
   - **Production:** `https://audiobookphile.com` (or your production domain)
   - **Preview:** the Vercel Preview URL for the branch (e.g. `https://audiobookphile-web-git-my-branch-org.vercel.app`) — or use a wildcard approach as described below
   - **Development:** `http://localhost:3000`
3. Redeploy after making changes so the new value is inlined into the build.

#### In the Supabase Auth dashboard

1. Open the [Supabase dashboard](https://supabase.com/dashboard), select your project, then go to **Authentication → URL Configuration**.
2. Set **Site URL** to your production URL (e.g. `https://audiobookphile.com`). This value is used by Supabase when generating email confirmation and password-reset links.
3. Under **Redirect URLs**, add an entry for each URL pattern that Supabase Auth is permitted to redirect to after an OAuth flow. At minimum add:
   - `https://audiobookphile.com/**` — production
   - `https://audiobookphile-web-*.vercel.app/**` — wildcard pattern covering all Vercel Preview deployment URLs
   - `http://localhost:3000/**` — local development

> **Why the wildcard is needed:** Each Vercel Preview deployment gets a unique URL. Adding a wildcard pattern (e.g. `https://audiobookphile-web-*.vercel.app/**`) to the Supabase redirect allow list means you do not need to register each preview URL individually.

---

## 4. Troubleshooting

### 4.1 All `/api/*` routes return 502 / 404 or "failed to fetch"

**Symptom:** Every request to an `/api/*` path fails with a network error, 502 Bad Gateway, or 404 Not Found, often with no useful response body.

**Root cause:** `NEXT_PUBLIC_SUPABASE_URL` was not set in the Vercel build environment. Because `NEXT_PUBLIC_*` variables are inlined at build time, the rewrite destination in `next.config.ts` resolved to a string like `undefined/functions/v1/api/*` at compile time and was baked into the build output.

**Fix:**

1. In the Vercel dashboard, go to **Settings → Environment Variables** and verify that `NEXT_PUBLIC_SUPABASE_URL` is set to your Supabase project URL for every environment (Production, Preview, and Development).
2. Trigger a fresh deployment — either push a new commit or click **Redeploy** in the Vercel dashboard. A redeploy without a new build will not pick up the corrected variable; the project must be rebuilt.
3. Confirm the `/api/*` routes respond correctly after the new deployment goes live.

---

### 4.2 Server actions or API routes return 500 with "Missing environment variable: SUPABASE_SERVICE_ROLE_KEY"

**Symptom:** Server-side operations (file uploads, user management, admin queries) return an HTTP 500 error. The Vercel function log shows: `Error: Missing environment variable: SUPABASE_SERVICE_ROLE_KEY`.

**Root cause:** Neither `SUPABASE_SERVICE_ROLE_KEY` nor the legacy alias `SUPABASE_SERVICE_KEY` is set in the Vercel environment where the request ran. This happens most often on Preview deployments that were not given the server-side variables when the project was first configured.

**Fix:**

1. In the Vercel dashboard, go to **Settings → Environment Variables**.
2. Add `SUPABASE_SERVICE_ROLE_KEY` with the service role key value from the Supabase dashboard (**Settings → API → service_role key**).
3. Apply it to the affected environment(s) — at minimum Production and Preview.
4. Redeploy the affected environment. Unlike build-time variables, server-side variables take effect on the next invocation after the deployment completes, but a new deployment is still recommended to ensure consistency.

See [§2](#2-supabase_service_role_key-vs-supabase_service_key) if you are migrating from the old `SUPABASE_SERVICE_KEY` name.

---

### 4.3 OAuth or email confirmation links redirect to the wrong URL

**Symptom:** After clicking a confirmation email, magic link, or password-reset link, the user is redirected to the wrong domain (e.g. the production domain instead of the Preview URL, or vice versa). OAuth sign-in completes but the callback lands on an unexpected host.

**Root cause:** `NEXT_PUBLIC_SITE_URL` in Vercel does not match the **Site URL** configured in the Supabase Auth dashboard, or the destination URL is not listed in the Supabase Auth **Redirect URLs** allow list. Supabase generates auth email links server-side using its own "Site URL" setting, independently of any Next.js configuration.

**Fix:**

1. Align the two settings:
   - Vercel: set `NEXT_PUBLIC_SITE_URL` to the correct canonical URL for each environment (see [§3](#3-next_public_site_url-and-supabase-auth) for per-environment values).
   - Supabase: set **Authentication → URL Configuration → Site URL** to match the production value of `NEXT_PUBLIC_SITE_URL`.
2. Add wildcard Preview URL patterns to **Authentication → URL Configuration → Redirect URLs** in the Supabase dashboard (e.g. `https://audiobookphile-web-*.vercel.app/**`) so that auth redirects to Preview deployments are permitted.
3. Redeploy the Vercel project so the updated `NEXT_PUBLIC_SITE_URL` is baked into the new build.
