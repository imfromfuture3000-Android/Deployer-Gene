#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# Termux setup script for Omega Prime Deployer
# Installs Node.js, Rust, and deps.

pkg update -y && pkg upgrade -y
pkg install -y nodejs-lts git curl openssl openssh clang make pkg-config

# Rust (uses rustup-init which works on Termux)
if ! command -v rustup >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
  source $HOME/.cargo/env
fi

# Ensure correct npm version
npm install -g npm@latest

# Install project dependencies
if [ ! -f package.json ]; then
  echo "Run this from repository root" >&2
  exit 1
fi
npm install

# Build TypeScript
npm run build || npx tsc

# Build Rust program
cargo build --manifest-path pentacle/Cargo.toml

echo "\n[OK] Termux environment ready. Use: npm run mainnet:copilot"
