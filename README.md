# Audiobookphile 🎧

A serverless, open-source audiobook and podcast client. Built with Next.js 16, Supabase, and deployed effortlessly on Vercel. 

Audiobookphile is designed for users who want a beautiful, premium "Liquid Glass" UI for their audiobooks, without the hassle of managing servers or docker containers. It's an excellent, zero-maintenance alternative to traditional self-hosted solutions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2A%2Agithub.com%2Fadvplyr%2Faudiobookphile&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_SITE_URL&project-name=audiobookphile&repository-name=audiobookphile)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth & Database**: [Supabase](https://supabase.com) (Postgres + Auth + Storage)
- **Deployment**: [Vercel](https://vercel.com)
- **Styling**: Tailwind CSS v4 (Liquid Glass Aesthetic)
- **Package Manager**: [Bun](https://bun.sh)

## One-Click Deployment

1. **Set up Supabase**: Create a free project on [Supabase](https://supabase.com).
2. **Deploy to Vercel**: Click the "Deploy with Vercel" button above.
3. **Configure Environment**: Provide your Supabase project URL and API keys during the Vercel deployment.
4. **Push Database Schema**: See the [Database Setup](#database-setup) section below.

## Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

| Variable                        | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-side service role key (never expose to browser) |
| `NEXT_PUBLIC_SITE_URL`          | Public URL of your app (required for OAuth redirects)  |
| `B2_ENDPOINT`                   | (Optional) Backblaze B2 S3 endpoint url                |
| `B2_REGION`                     | (Optional) Backblaze B2 S3 region                      |
| `B2_BUCKET_NAME`                | (Optional) Backblaze B2 Bucket name                    |
| `B2_KEY_ID`                     | (Optional) Backblaze B2 Key ID                         |
| `B2_APP_KEY`                    | (Optional) Backblaze B2 Application Key                |

> `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_` and must never appear in client-side code.

## Local Development

```bash
# Install dependencies
bun install

# Start the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup & Migration

All schema changes are tracked as Supabase CLI migration files in `supabase/migrations/`.

```bash
# Install Supabase CLI
bunx supabase link --project-ref <your-project-ref>

# Apply all migrations
bunx supabase db push
```

### Migrating from Audiobookshelf (SQLite)
If you are coming from a traditional self-hosted Audiobookshelf instance and want to move your metadata to Audiobookphile's Postgres backend, we've included a migration toolkit! 
Check out the `supabase-migration-toolkit` skill/scripts to convert your SQLite schema and bulk-upload your data to Supabase.

## Hybrid Storage (Supabase + Backblaze B2)

The client supports a hybrid storage model to minimize cloud costs.
- **Small files (< 25MB):** Cover images, metadata files, and short podcast clips are securely uploaded directly to Supabase Storage.
- **Large files (>= 25MB):** Full audiobooks are securely uploaded directly to Backblaze B2 using S3 pre-signed URLs.

To enable this, provide the `B2_*` environment variables. The client and backend will seamlessly route uploads and playback between the two providers based on file size.

## CI/CD (GitHub Actions)

The repository comes pre-configured with two GitHub Actions:
1. **Next.js Checks (`nextjs-check.yml`)**: Runs TypeScript and Linter checks on PRs.
2. **Edge Functions Deploy (`edge-functions.yml`)**: Deploys Supabase Edge Functions on pushes to `main`.

Ensure you configure your GitHub Repository Secrets (`SUPABASE_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`) to enable Edge Function deployments.

## Docker (Local / Self-Hosted)

A Docker setup is available if you prefer to host it yourself instead of Vercel.

```bash
docker compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change. Please ensure you do not use any GPLv3 assets or proprietary logos from other projects when contributing.
