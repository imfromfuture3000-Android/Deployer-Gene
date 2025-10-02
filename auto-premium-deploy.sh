#!/bin/bash

echo "🚀 AUTOMATED PREMIUM DEPLOYMENT"
echo "================================"
echo ""

# Check if payer exists and has balance
PAYER_PATH=".cache/deployer-keypair.json"

if [ ! -f "$PAYER_PATH" ]; then
    echo "📝 Generating payer keypair..."
    node premium-deploy.js
    echo ""
    echo "✅ Payer generated!"
    echo "📋 Next: Fund the address shown above with 0.01+ SOL"
    echo "💡 Then run: npm run deploy:premium"
    exit 0
fi

echo "✅ Payer keypair found"
echo "🚀 Starting premium deployment..."
echo ""

npm run deploy:premium

if [ $? -eq 0 ]; then
    echo ""
    echo "✨ Deployment complete!"
    echo "📋 Next steps:"
    echo "   1. npm run mainnet:mint-initial"
    echo "   2. npm run mainnet:set-metadata"
    echo "   3. npm run mainnet:lock"
else
    echo ""
    echo "❌ Deployment failed"
    echo "💡 Check if payer has sufficient SOL balance"
fi
