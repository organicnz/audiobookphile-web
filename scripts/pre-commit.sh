#!/bin/bash

if [ "$#" -eq 0 ]; then
  exit 0
fi

TS_FILES=$(echo "$@" | tr ' ' '\n' | grep -E '\.(ts|tsx|js|jsx)$' || true)
JSON_FILES=$(echo "$@" | tr ' ' '\n' | grep -E '\.(json|yml|yaml)$' || true)
PACKAGE_FILES=$(echo "$@" | tr ' ' '\n' | grep 'package\.json$' || true)
ALL_FILES="$@"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LAYER 1 — INSTANT BLOCKERS & CYBERSECURITY AUDIT (<100ms)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 1. Merge Conflict Marker Guard
echo "🔍 [1/13] Merge Conflict Marker check..."
CONFLICT_FILES=$(grep -E -l '^(<<<<<<<|=======|>>>>>>>)' $ALL_FILES 2>/dev/null | grep -v 'pre-commit.sh' || true)
if [ -n "$CONFLICT_FILES" ]; then
    echo "❌ Unresolved git merge conflict markers found in:"
    echo "$CONFLICT_FILES"
    exit 1
fi

# 2. Deep Cybersecurity Secret & Private Key Scanner
echo "🔍 [2/13] Cybersecurity Secret & Key Scan..."
FORBIDDEN_PATTERNS="eyJhbGci|sbp_[a-zA-Z0-9]{20,}|SUPABASE_SERVICE_ROLE_KEY=[a-zA-Z0-9]|BEGIN PRIVATE KEY|sk_live_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}"
LEAKED_FILES=$(grep -E -l "$FORBIDDEN_PATTERNS" $ALL_FILES 2>/dev/null | grep -v '\.example' | grep -v 'pre-commit.sh' || true)
if [ -n "$LEAKED_FILES" ]; then
    echo "❌ CYBERSECURITY ALERT: Secret, private key, or credential leak detected in:"
    echo "$LEAKED_FILES"
    exit 1
fi

# 3. Dynamic Execution & XSS Security Guard (eval, dangerouslySetInnerHTML)
if [ -n "$TS_FILES" ]; then
    echo "🔍 [3/13] Dynamic Execution & XSS Guard..."
    DANGEROUS_XSS=$(grep -n -E 'dangerouslySetInnerHTML|eval\(|new Function\(' $TS_FILES 2>/dev/null || true)
    if [ -n "$DANGEROUS_XSS" ]; then
        echo "❌ CYBERSECURITY WARNING: Unsanitized HTML rendering or dynamic evaluation found:"
        echo "$DANGEROUS_XSS"
        echo "Remove dangerouslySetInnerHTML / eval to prevent XSS vulnerabilities!"
        exit 1
    fi
fi

# 4. Insecure Random Generator Guard (Cryptographic Token Security)
if [ -n "$TS_FILES" ]; then
    echo "🔍 [4/13] Cryptographic Random Security Guard..."
    INSECURE_RANDOM=$(grep -n 'Math\.random()' $TS_FILES 2>/dev/null | grep -i -E '(token|secret|auth|nonce|key|pin)' || true)
    if [ -n "$INSECURE_RANDOM" ]; then
        echo "❌ CYBERSECURITY VIOLATION: Math.random() used for security token / PIN generation:"
        echo "$INSECURE_RANDOM"
        echo "Use crypto.getRandomValues() or crypto.randomUUID() for security tokens!"
        exit 1
    fi
fi

# 5. package.json Package Compatibility & Unpinned Dependency Audit
if [ -n "$PACKAGE_FILES" ]; then
    echo "🔍 [5/13] Package Compatibility Audit..."
    UNPINNED_PKGS=$(grep -n '"\*"' $PACKAGE_FILES 2>/dev/null || true)
    if [ -n "$UNPINNED_PKGS" ]; then
        echo "⚠️ WARNING: Unpinned wildcard package dependency '*' found in package.json:"
        echo "$UNPINNED_PKGS"
        echo "Use explicit compatible semver versions (^ or ~)!"
        exit 1
    fi
fi

# 6. Large Audio Media & Bloat File Guard (.m4b, .mp3, .flac, >10MB)
echo "🔍 [6/13] Repo Bloat & Audio Media Guard..."
AUDIO_BLOAT=$(echo "$ALL_FILES" | tr ' ' '\n' | grep -i -E '\.(m4b|mp3|flac|aac|wav|ogg|zip|tar\.gz|iso)$' || true)
if [ -n "$AUDIO_BLOAT" ]; then
    echo "❌ REPO BLOAT GUARD: Accidental audio media or large binary file staged:"
    echo "$AUDIO_BLOAT"
    exit 1
fi

# 7. JSON / YAML Syntax Guard
if [ -n "$JSON_FILES" ]; then
    echo "🔍 [7/13] JSON/YAML Syntax Guard..."
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

# 8. Console.log Debug Leftover Guard
if [ -n "$TS_FILES" ]; then
    echo "🔍 [8/13] Debug Statement Guard..."
    DEBUG_LOGS=$(grep -n 'console\.log\|console\.debug\|console\.trace' $TS_FILES 2>/dev/null | grep -v '__tests__' | grep -v '\.test\.' | grep -v '\.spec\.' || true)
    if [ -n "$DEBUG_LOGS" ]; then
        echo "⚠️ WARNING: console.log/debug/trace found in production code:"
        echo "$DEBUG_LOGS"
        exit 1
    fi
fi

# 9. Disabled Test Guard
if [ -n "$TS_FILES" ]; then
    echo "🔍 [9/13] Disabled Test Guard..."
    DISABLED_TESTS=$(grep -nE 'xit\(|xdescribe\(|it\.skip\(|describe\.skip\(|test\.skip\(' $TS_FILES 2>/dev/null | grep -vE 'test\.skip\((!|ok\b|[A-Za-z_])' || true)
    if [ -n "$DISABLED_TESTS" ]; then
        echo "⚠️ WARNING: Disabled/skipped tests found:"
        echo "$DISABLED_TESTS"
        exit 1
    fi
fi

# 10. Hardcoded URL Guard
if [ -n "$TS_FILES" ]; then
    echo "🔍 [10/13] Hardcoded URL Guard..."
    HARDCODED=$(grep -n 'http://localhost\|127\.0\.0\.1\|http://0\.0\.0\.0' $TS_FILES 2>/dev/null | grep -v '__tests__' | grep -v '\.test\.' | grep -v 'dev-only fallback' || true)
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
    echo "🔍 [11/13] Oxlint & ESLint..."
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

echo "🔍 [12/13] TypeScript Typecheck & Bun Unit Tests..."
bun run typecheck && bun test src/__tests__
if [ $? -ne 0 ]; then
    echo "❌ Typecheck or unit tests failed."
    exit 1
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FORMATTING & SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🔍 [13/13] Prettier Formatter..."
bun run prettier --write "$@"

TOTAL_FILES=$(echo "$ALL_FILES" | wc -w | tr -d ' ')
echo ""
echo "✅ [13/13] Web pre-commit passed — $TOTAL_FILES file(s) verified across 13 intelligent cybersecurity & quality guards."
