#!/bin/bash
# Unified pre-push delivery gate for audiobookphile-web.
# Runs checks in sequence so the first failure is the one you see.
# e2e-library soft-skips when PLAYWRIGHT_* creds are absent.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

FAILED=0
step() {
  local label="$1"
  shift
  echo ""
  echo "━━━ $label ━━━"
  if ! "$@"; then
    echo "❌ FAILED: $label"
    FAILED=1
  else
    echo "✅ $label"
  fi
}

step "Typecheck" bun run typecheck
step "Unit tests" bun test src/__tests__
step "Lint (errors only)" bash -c 'bun run lint >/tmp/lint-out.txt 2>&1 || { grep -E "error|✖|ERROR" /tmp/lint-out.txt | head -40; exit 1; }'
step "Security audit" ./scripts/security-audit.sh
step "Library e2e resilience" ./scripts/e2e-library.sh

echo ""
if [ "$FAILED" -ne 0 ]; then
  echo "🚫 pre-push gate: FAILED — fix the steps above before pushing."
  exit 1
fi
echo "🚀 pre-push gate: all checks green."
