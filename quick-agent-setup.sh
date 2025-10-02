#!/bin/bash

# 🚀 Quick Agent Setup - Auto-configure for deployment

echo "🤖 AMAZON Q COPILOT - QUICK AGENT SETUP"
echo "========================================"
echo ""

# Use public Solana RPC (free, rate-limited)
echo "📡 Configuring Solana RPC..."
cat >> .env << EOF

# Agent Auto-Configuration
RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=
QUICKNODE_ENDPOINT=
GITHUB_TOKEN=
EOF

echo "✅ Basic configuration complete"
echo ""
echo "🔍 Validating agent permissions..."
npm run agent:validate

echo ""
echo "✨ Agent is ready for automated deployment!"
echo ""
echo "📋 To add premium RPC access (recommended):"
echo "   Run: npm run agent:setup"
echo ""
echo "🚀 To deploy now:"
echo "   Run: npm run reclaim:auto"
