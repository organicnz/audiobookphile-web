#!/bin/bash

if [ "$#" -eq 0 ]; then
  exit 0
fi

# 1. Merge Conflict Marker Guard
echo "Running Merge Conflict Marker check..."
CONFLICT_FILES=$(grep -E -l '^(<<<<<<<|=======|>>>>>>>)' "$@" 2>/dev/null | grep -v 'pre-commit.sh' || true)
if [ -n "$CONFLICT_FILES" ]; then
    echo "❌ ERROR: Unresolved git merge conflict markers found in:"
    echo "$CONFLICT_FILES"
    echo "Please resolve conflict markers (<<<<<<< HEAD, =======, >>>>>>>) before committing!"
    exit 1
fi

# 2. Secret Scan Guard
echo "Running Secret Scan check..."
FORBIDDEN_PATTERNS="eyJh|eyJhbGci|sbp_[a-zA-Z0-9]{40}|BEGIN PRIVATE KEY|service_role"
LEAKED_FILES=$(grep -E -l "$FORBIDDEN_PATTERNS" "$@" 2>/dev/null | grep -v '\.example' | grep -v 'pre-commit.sh' || true)
if [ -n "$LEAKED_FILES" ]; then
    echo "❌ SECURITY ALERT: Potential secret / credential leak detected in:"
    echo "$LEAKED_FILES"
    echo "Please remove hardcoded secrets or service role keys before committing!"
    exit 1
fi

# 3. Oxlint (Rust)
echo "Running Oxlint (Rust)..."
bun run oxlint --fix "$@"
if [ $? -ne 0 ]; then
    echo "❌ Oxlint failed. Please fix the errors before committing."
    exit 1
fi

# 4. ESLint
echo "Running ESLint..."
bun run eslint --fix "$@"
if [ $? -ne 0 ]; then
    echo "❌ ESLint failed. Please fix the errors before committing."
    exit 1
fi

# 5. TypeScript Typecheck
echo "Running TypeScript Typecheck..."
bun run typecheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript typecheck failed. Please fix type errors before committing."
    exit 1
fi

# 6. Bun Unit Tests
echo "Running Bun Unit Tests..."
bun test src/__tests__
if [ $? -ne 0 ]; then
    echo "❌ Unit tests failed. Please fix failing tests before committing."
    exit 1
fi

# 7. Prettier Formatter
echo "Running Prettier..."
bun run prettier --write "$@"

echo "✅ Web pre-commit verification passed cleanly!"
