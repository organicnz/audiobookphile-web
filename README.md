# Audiobookshelf Client (React / Next.js)

A Next.js 15 web client for [Audiobookshelf](https://github.com/advplyr/audiobookshelf), built with React, Supabase, and deployed on Vercel. This client is in active development and will replace the existing VueJS web client.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth & Database**: [Supabase](https://supabase.com) (Postgres + Auth + Storage)
- **Deployment**: [Vercel](https://vercel.com)
- **Package Manager**: [Bun](https://bun.sh)

## Prerequisites

- [Bun](https://bun.sh) installed
- A [Supabase](https://supabase.com) project with the schema migrations applied (see [Database Setup](#database-setup))
- A Vercel account (for production deployment)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable                        | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-side service role key (never expose to browser) |
| `NEXT_PUBLIC_SITE_URL`          | Public URL of your app (required for OAuth redirects)  |

> `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_` and must never appear in client-side code.

## Local Development

```bash
# Install dependencies
bun install

# Start the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

All schema changes are tracked as Supabase CLI migration files in `supabase/migrations/`.

```bash
# Install Supabase CLI (dev dependency — already in package.json)
# Link to your Supabase project
bunx supabase link --project-ref <your-project-ref>

# Apply all migrations
bunx supabase db push

# Regenerate TypeScript types after schema changes
bunx supabase gen types typescript --linked > src/types/supabase.ts
```

## Production Deployment (Vercel)

1. Push to your GitHub repository.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add the environment variables listed above in the Vercel project settings.
4. Deploy — Vercel handles SSL and CDN automatically.

For a custom domain, add a `CNAME` record pointing to `cname.vercel-dns.com` (DNS only, no Cloudflare proxy).

## Docker (Local / Self-Hosted)

A Docker setup is available for local testing or self-hosted deployments.

```bash
# Build and run with docker-compose
docker compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

> Note: The Docker setup does not include SSL termination. For production self-hosting, place a reverse proxy (Caddy, Nginx) in front of the container.

## Running Tests

```bash
# Cypress component tests
bun run test

# Unit tests (Vitest)
bunx vitest run
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages and route handlers
│   ├── (blank)/      # Unauthenticated pages (login, signup, forgot-password)
│   ├── (main)/       # Authenticated app shell (library, settings, etc.)
│   ├── api/          # Route handlers (playback, upload)
│   └── auth/         # OAuth callback and error pages
├── contexts/         # React context providers
├── lib/              # API module (supabase-api.ts) and utilities
├── types/            # TypeScript types (supabase.ts, index.ts)
└── utils/            # Supabase client helpers (browser, server, middleware)
```

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.
