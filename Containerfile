# Containerfile for Podman
# This file replaces Dockerfile for Podman-compatible builds
# Podman is rootless by default and more secure than Docker

### STAGE 0: Install dependencies ###
FROM oven/bun:1.3.9-alpine AS deps

WORKDIR /app

# Copy lockfile and manifests
COPY package.json bun.lock .npmrc ./

# Override engine-strict so bun install works in containers
RUN echo "" > .npmrc && bun install --frozen-lockfile

### STAGE 1: Build ###
FROM oven/bun:1.3.9-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry for privacy
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time public env vars (passed via --build-arg in CI)
# These are baked into the build at image creation time
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Disable engine-strict so bun run build works
RUN echo "" > .npmrc && bun run build

### STAGE 2: Runtime ###
FROM node:22-alpine AS runner

WORKDIR /app

# Production environment configuration
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security (Podman best practice)
# Podman runs rootless by default, but we add an extra layer of isolation
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Copy standalone server and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment for the server
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health check - critical for Podman/Kubernetes deployments
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]
