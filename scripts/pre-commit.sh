#!/bin/bash

if [ "$#" -eq 0 ]; then
  exit 0
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
