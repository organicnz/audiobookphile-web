# Web App Deployment

## Vercel Deployment
Aficionado Web is deployed exclusively on [Vercel](https://vercel.com).
- **Environment Variables:** All environment variables must be configured in the Vercel Dashboard.
- **Preview Deployments:** Every Pull Request automatically generates a Vercel preview URL for staging and QA.

## Supabase Environments
- We maintain separate Supabase projects for `local`, `staging`, and `production`.
- **Migrations:** Use the Supabase CLI to manage database migrations before deploying to production.

## Caching Strategy
- We leverage Next.js Data Cache and Full Route Cache to serve pages quickly.
- Use `revalidatePath` and `revalidateTag` in Server Actions to purge the cache when data is mutated.
