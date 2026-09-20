#!/bin/bash
set -e

if [ "$#" -eq 0 ]; then
  exit 0
fi

CSS_FILES=$(echo "$@" | tr ' ' '\n' | grep '\.css$' || true)
OTHER_FILES=$(echo "$@" | tr ' ' '\n' | grep -v '\.css$' || true)

if [ -n "$CSS_FILES" ]; then
  echo "Formatting CSS with Biome..."
  bunx biome format --write $CSS_FILES
fi

if [ -n "$OTHER_FILES" ]; then
  echo "Running Prettier on other files..."
  bun run prettier --write $OTHER_FILES
fi
