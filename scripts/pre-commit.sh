#!/bin/bash

if [ "$#" -eq 0 ]; then
  exit 0
fi

# Secret Scan Guard
echo "Running Secret Scan check..."
FORBIDDEN_PATTERNS="eyJh|eyJhbGci|sbp_[a-zA-Z0-9]{40}|BEGIN PRIVATE KEY|service_role"
LEAKED_FILES=$(grep -E -l "$FORBIDDEN_PATTERNS" "$@" 2>/dev/null | grep -v '\.example' | grep -v 'pre-commit.sh' || true)

if [ -n "$LEAKED_FILES" ]; then
    echo "❌ SECURITY ALERT: Potential secret / credential leak detected in:"
    echo "$LEAKED_FILES"
    echo "Please remove hardcoded secrets or service role keys before committing!"
    exit 1
fi

echo "Running Oxlint (Rust)..."
bun run oxlint --fix "$@"
if [ $? -ne 0 ]; then
    echo "❌ Oxlint failed. Please fix the errors before committing."
    exit 1
fi

echo "Running ESLint..."
bun run eslint --fix "$@"
if [ $? -ne 0 ]; then
    echo "❌ ESLint failed. Please fix the errors before committing."
    exit 1
fi

echo "Running TypeScript Typecheck..."
bun run typecheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript typecheck failed. Please fix type errors before committing."
    exit 1
fi

echo "Running Bun Unit Tests..."
bun test src/__tests__
if [ $? -ne 0 ]; then
    echo "❌ Unit tests failed. Please fix failing tests before committing."
    exit 1
fi

echo "Running Prettier..."
bun run prettier --write "$@"

echo "✅ Web pre-commit verification passed cleanly!"
