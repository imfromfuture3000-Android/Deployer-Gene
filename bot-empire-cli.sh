#!/bin/bash

# 🚀 Deployer-Gene Bot Empire CLI
# Creates 10 Solana addresses for bot army

set -e

echo "🤖 DEPLOYER-GENE: Creating 10 Bot Addresses"
echo "=========================================="

# Create .cache directory
mkdir -p .cache

# Create bot addresses
for i in {1..10}; do
  echo ""
  echo "Creating Bot $i..."
  solana-keygen new --no-bip39-passphrase --silent --outfile ".cache/bot-$i.json"
  BOT_ADDRESS=$(solana-keygen pubkey ".cache/bot-$i.json")
  echo "✅ Bot $i: $BOT_ADDRESS"
  
  # Save to master list
  echo "$BOT_ADDRESS" >> .cache/bot-addresses.txt
done

echo ""
echo "=========================================="
echo "✅ 10 Bot Addresses Created"
echo "📁 Keypairs saved in .cache/bot-*.json"
echo "📋 Addresses saved in .cache/bot-addresses.txt"
echo ""
echo "🔗 Next: Fund bots and deploy empire"
echo "   node deploy-10-bots-empire.js"
