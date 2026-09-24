#!/bin/bash
# Pre-push / CI gate for library + entity e2e resilience tests.
# Skips cleanly when Playwright credentials are not configured so local/CI
# without seeds stay green (mirrors fixtures.ts soft-skip behaviour).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Load .env.local / .env like the Playwright fixtures do
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
if [ -f .env ]; then set -a; . ./.env; set +a; fi

if [ -z "${PLAYWRIGHT_ADMIN_EMAIL:-}" ] || [ -z "${PLAYWRIGHT_ADMIN_PASSWORD:-}" ]; then
  if [ -z "${PLAYWRIGHT_MEMBER_EMAIL:-}" ] || [ -z "${PLAYWRIGHT_MEMBER_PASSWORD:-}" ]; then
    echo "⏭️  Skipping e2e (library resilience): PLAYWRIGHT_ADMIN_* / PLAYWRIGHT_MEMBER_* not set"
    exit 0
  fi
fi

# Optional: limit to chromium for speed on pre-push
PROJECT="${E2E_PROJECT:-chromium}"

echo "🧪 Running library resilience e2e (project=$PROJECT)..."
bunx playwright test tests/e2e/library-resilience.spec.ts --project="$PROJECT" --reporter=line
