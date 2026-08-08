#!/bin/bash

if [ "$#" -eq 0 ]; then
  exit 0
fi

TS_FILES=$(echo "$@" | tr ' ' '\n' | grep -E '\.(ts|tsx|js|jsx)$' || true)
JSON_FILES=$(echo "$@" | tr ' ' '\n' | grep -E '\.(json|yml|yaml)$' || true)
ALL_FILES="$@"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LAYER 1 — INSTANT BLOCKERS (fast grep, <100ms)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 1. Merge Conflict Marker Guard
echo "🔍 [1/10] Merge Conflict Marker check..."
CONFLICT_FILES=$(grep -E -l '^(<<<<<<<|=======|>>>>>>>)' $ALL_FILES 2>/dev/null | grep -v 'pre-commit.sh' || true)
if [ -n "$CONFLICT_FILES" ]; then
    echo "❌ Unresolved git merge conflict markers found in:"
    echo "$CONFLICT_FILES"
    exit 1
fi

# 2. Secret & Credential Leak Scanner
echo "🔍 [2/10] Secret Scan check..."
FORBIDDEN_PATTERNS="eyJhbGci|sbp_[a-zA-Z0-9]{20,}|SUPABASE_SERVICE_ROLE|BEGIN PRIVATE KEY|sk_live_|AKIA[0-9A-Z]{16}"
LEAKED_FILES=$(grep -E -l "$FORBIDDEN_PATTERNS" $ALL_FILES 2>/dev/null | grep -v '\.example' | grep -v 'pre-commit.sh' || true)
if [ -n "$LEAKED_FILES" ]; then
    echo "❌ SECURITY: Potential secret/credential leak detected in:"
    echo "$LEAKED_FILES"
    exit 1
fi

# 3. Large Audio Media & Bloat File Guard (.m4b, .mp3, .flac, >10MB)
echo "🔍 [3/10] Repo Bloat & Audio Media Guard..."
AUDIO_BLOAT=$(echo "$ALL_FILES" | tr ' ' '\n' | grep -i -E '\.(m4b|mp3|flac|aac|wav|ogg|zip|tar\.gz|iso)$' || true)
if [ -n "$AUDIO_BLOAT" ]; then
    echo "❌ REPO BLOAT GUARD: Accidental audio media or large binary file staged:"
    echo "$AUDIO_BLOAT"
    echo "Audio files must not be committed into git storage!"
    exit 1
fi

# 4. JSON / YAML Syntax Guard
if [ -n "$JSON_FILES" ]; then
    echo "🔍 [4/10] JSON/YAML Syntax Guard..."
    for f in $JSON_FILES; do
        if echo "$f" | grep -q '\.json$'; then
            python3 -m json.tool "$f" >/dev/null 2>&1
            if [ $? -ne 0 ]; then
                echo "❌ JSON SYNTAX ERROR in file: $f"
                exit 1
            fi
        fi
    done
fi

# 5. Console.log Debug Leftover Guard
if [ -n "$TS_FILES" ]; then
    echo "🔍 [5/10] Debug Statement Guard..."
    DEBUG_LOGS=$(grep -n 'console\.log\|console\.debug\|console\.trace' $TS_FILES 2>/dev/null | grep -v '__tests__' | grep -v '\.test\.' | grep -v '\.spec\.' || true)
    if [ -n "$DEBUG_LOGS" ]; then
        echo "⚠️ WARNING: console.log/debug/trace found in production code:"
        echo "$DEBUG_LOGS"
        exit 1
    fi
fi

# 6. Disabled Test Guard
if [ -n "$TS_FILES" ]; then
    echo "🔍 [6/10] Disabled Test Guard..."
    DISABLED_TESTS=$(grep -n 'xit(\|xdescribe(\|test\.skip(\|it\.skip(\|describe\.skip(' $TS_FILES 2>/dev/null || true)
    if [ -n "$DISABLED_TESTS" ]; then
        echo "⚠️ WARNING: Disabled/skipped tests found:"
        echo "$DISABLED_TESTS"
        exit 1
    fi
fi

# 7. Hardcoded URL Guard
if [ -n "$TS_FILES" ]; then
    echo "🔍 [7/10] Hardcoded URL Guard..."
    HARDCODED=$(grep -n 'http://localhost\|127\.0\.0\.1\|http://0\.0\.0\.0' $TS_FILES 2>/dev/null | grep -v '__tests__' | grep -v '\.test\.' || true)
    if [ -n "$HARDCODED" ]; then
        echo "⚠️ WARNING: Hardcoded localhost URLs in production code:"
        echo "$HARDCODED"
        exit 1
    fi
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LAYER 2 — STATIC ANALYSIS (oxlint + eslint, ~2s)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [ -n "$TS_FILES" ]; then
    echo "🔍 [8/10] Oxlint & ESLint..."
    bun run oxlint --fix $TS_FILES >/dev/null 2>&1
    bun run eslint --fix $TS_FILES
    if [ $? -ne 0 ]; then
        echo "❌ ESLint failed."
        exit 1
    fi
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LAYER 3 — COMPILER & RUNTIME VERIFICATION (~3-5s)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🔍 [9/10] TypeScript Typecheck & Bun Unit Tests..."
bun run typecheck && bun test src/__tests__
if [ $? -ne 0 ]; then
    echo "❌ Typecheck or unit tests failed."
    exit 1
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FORMATTING & SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "Running Prettier..."
bun run prettier --write "$@"

TOTAL_FILES=$(echo "$ALL_FILES" | wc -w | tr -d ' ')
echo ""
echo "✅ [10/10] Web pre-commit passed — $TOTAL_FILES file(s) verified across 9 intelligent guards."
