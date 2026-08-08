#!/bin/bash

if [ "$#" -eq 0 ]; then
  exit 0
fi

TS_FILES=$(echo "$@" | tr ' ' '\n' | grep -E '\.(ts|tsx|js|jsx)$' || true)
ALL_FILES="$@"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LAYER 1 — INSTANT BLOCKERS (fast grep, <100ms)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 1. Merge Conflict Marker Guard
echo "🔍 [1/9] Merge Conflict Marker check..."
CONFLICT_FILES=$(grep -E -l '^(<<<<<<<|=======|>>>>>>>)' $ALL_FILES 2>/dev/null | grep -v 'pre-commit.sh' || true)
if [ -n "$CONFLICT_FILES" ]; then
    echo "❌ Unresolved git merge conflict markers found in:"
    echo "$CONFLICT_FILES"
    exit 1
fi

# 2. Secret & Credential Leak Scanner
echo "🔍 [2/9] Secret Scan check..."
FORBIDDEN_PATTERNS="eyJhbGci|sbp_[a-zA-Z0-9]{20,}|SUPABASE_SERVICE_ROLE|BEGIN PRIVATE KEY|sk_live_|AKIA[0-9A-Z]{16}"
LEAKED_FILES=$(grep -E -l "$FORBIDDEN_PATTERNS" $ALL_FILES 2>/dev/null | grep -v '\.example' | grep -v 'pre-commit.sh' || true)
if [ -n "$LEAKED_FILES" ]; then
    echo "❌ SECURITY: Potential secret/credential leak detected in:"
    echo "$LEAKED_FILES"
    exit 1
fi

# 3. Console.log Debug Leftover Guard (non-test files only)
if [ -n "$TS_FILES" ]; then
    echo "🔍 [3/9] Debug Statement Guard..."
    DEBUG_LOGS=$(grep -n 'console\.log\|console\.debug\|console\.trace' $TS_FILES 2>/dev/null | grep -v '__tests__' | grep -v '\.test\.' | grep -v '\.spec\.' || true)
    if [ -n "$DEBUG_LOGS" ]; then
        echo "⚠️  WARNING: console.log/debug/trace found in production code:"
        echo "$DEBUG_LOGS"
        echo "Use structured logging or remove debug statements."
        exit 1
    fi
fi

# 4. Disabled Test Guard (skip/xit/xdescribe)
if [ -n "$TS_FILES" ]; then
    echo "🔍 [4/9] Disabled Test Guard..."
    DISABLED_TESTS=$(grep -n 'xit(\|xdescribe(\|test\.skip(\|it\.skip(\|describe\.skip(' $TS_FILES 2>/dev/null || true)
    if [ -n "$DISABLED_TESTS" ]; then
        echo "⚠️  WARNING: Disabled/skipped tests found:"
        echo "$DISABLED_TESTS"
        echo "Remove .skip/xit/xdescribe before committing."
        exit 1
    fi
fi

# 5. Hardcoded URL / Dev Environment Guard
if [ -n "$TS_FILES" ]; then
    echo "🔍 [5/9] Hardcoded URL Guard..."
    HARDCODED=$(grep -n 'http://localhost\|127\.0\.0\.1\|http://0\.0\.0\.0' $TS_FILES 2>/dev/null | grep -v '__tests__' | grep -v '\.test\.' || true)
    if [ -n "$HARDCODED" ]; then
        echo "⚠️  WARNING: Hardcoded localhost URLs in production code:"
        echo "$HARDCODED"
        echo "Use environment variables for URLs."
        exit 1
    fi
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LAYER 2 — STATIC ANALYSIS (oxlint + eslint, ~2s)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🔍 [6/9] Oxlint (Rust)..."
bun run oxlint --fix "$@"
if [ $? -ne 0 ]; then
    echo "❌ Oxlint failed."
    exit 1
fi

echo "🔍 [7/9] ESLint..."
bun run eslint --fix "$@"
if [ $? -ne 0 ]; then
    echo "❌ ESLint failed."
    exit 1
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LAYER 3 — COMPILER & RUNTIME VERIFICATION (~3-5s)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🔍 [8/9] TypeScript Typecheck (tsc --noEmit)..."
bun run typecheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript typecheck failed."
    exit 1
fi

echo "🔍 [9/9] Bun Unit Tests (31 tests)..."
bun test src/__tests__
if [ $? -ne 0 ]; then
    echo "❌ Unit tests failed."
    exit 1
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FORMATTING & SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "Running Prettier..."
bun run prettier --write "$@"

TOTAL_FILES=$(echo "$ALL_FILES" | wc -w | tr -d ' ')
echo ""
echo "✅ Web pre-commit passed — $TOTAL_FILES file(s) verified across 9 intelligent guards."
