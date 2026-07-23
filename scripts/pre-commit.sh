#!/bin/bash
set -e

# Ensure we have files to process
if [ "$#" -eq 0 ]; then
  exit 0
fi

echo "Running Oxlint (Rust)..."
bun run oxlint --fix "$@"

echo "Running ESLint..."
bun run eslint --fix "$@"

echo "Running Prettier..."
bun run prettier --write "$@"
