#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# Wrapper to run full deployment in Termux after setup

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.sample and fill values." >&2
  exit 1
fi

npm run mainnet:all
