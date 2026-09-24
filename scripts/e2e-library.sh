#!/bin/bash
# Pre-push / CI gate for library + entity e2e resilience tests.
# Admin credentials are required because the suite verifies the admin edit flow.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Load .env.local / .env like the Playwright fixtures do
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
if [ -f .env ]; then set -a; . ./.env; set +a; fi

if [ -z "${PLAYWRIGHT_ADMIN_EMAIL:-}" ] || [ -z "${PLAYWRIGHT_ADMIN_PASSWORD:-}" ]; then
  echo "🚫 e2e gate requires PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD"
  exit 1
fi

# Optional: limit to chromium for speed on pre-push
PROJECT="${E2E_PROJECT:-chromium}"

echo "🧪 Running library resilience e2e (project=$PROJECT)..."
bunx playwright test tests/e2e/library-resilience.spec.ts --project="$PROJECT" --reporter=line
