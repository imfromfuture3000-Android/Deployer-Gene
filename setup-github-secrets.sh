#!/bin/bash

# GitHub Secrets Setup Script
# Run: chmod +x setup-github-secrets.sh && ./setup-github-secrets.sh

REPO="imfromfuture3000-Android/Deployer-Gene"

echo "🔐 Setting up GitHub Secrets for OMEGA Deployer"
echo "Repository: $REPO"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Install: https://cli.github.com/"
    exit 1
fi

# Load environment variables
source .env

# Set secrets
gh secret set RPC_URL -b "$RPC_URL" -R "$REPO"
gh secret set WSS_URL -b "$WSS_URL" -R "$REPO"
gh secret set HELIUS_API_KEY -b "$HELIUS_API_KEY" -R "$REPO"
gh secret set RELAYER_URL -b "$RELAYER_URL" -R "$REPO"
gh secret set RELAYER_PUBKEY -b "$RELAYER_PUBKEY" -R "$REPO"
gh secret set RELAYER_API_KEY -b "$RELAYER_API_KEY" -R "$REPO"
gh secret set TREASURY_PUBKEY -b "$TREASURY_PUBKEY" -R "$REPO"
gh secret set MINT_ADDRESS -b "$MINT_ADDRESS" -R "$REPO"
gh secret set WEBHOOK_URL -b "$WEBHOOK_URL" -R "$REPO"

# Bot addresses
gh secret set BOT_1_PUBKEY -b "$BOT_1_PUBKEY" -R "$REPO"
gh secret set BOT_2_PUBKEY -b "$BOT_2_PUBKEY" -R "$REPO"
gh secret set BOT_3_PUBKEY -b "$BOT_3_PUBKEY" -R "$REPO"
gh secret set BOT_4_PUBKEY -b "$BOT_4_PUBKEY" -R "$REPO"
gh secret set BOT_5_PUBKEY -b "$BOT_5_PUBKEY" -R "$REPO"

# Deployer private key
gh secret set DEPLOYER_PRIVATE_KEY -b "$(cat .deployer.key)" -R "$REPO"

echo "✅ All secrets configured successfully"
echo "🚀 Ready for production deployment"