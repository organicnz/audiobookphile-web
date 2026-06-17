#!/bin/bash
set -e

if [ "$#" -eq 0 ]; then
  exit 0
fi

echo "Running Prettier on other files..."
bun run prettier --write "$@"
