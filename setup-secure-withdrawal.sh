#!/bin/bash
# Secure Withdrawal Setup Script

echo "🔐 SETTING UP SECURE AUTOMATED WITHDRAWAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Set private key as environment variable (SECURE)
export DEPLOYER_PRIVATE_KEY="2AHAs1gdHSGn2REJbARigh5CLoRuR9gdNTMTKu5UJBVVovXUxhPYeLFYTVgov7gyes4QkwLhgw89PAsGZbUjK2Yv"

echo "✅ Private key loaded securely into environment"
echo "🚀 Running automated withdrawal..."

# Install required package if needed
npm install bs58 --save

# Run the automated withdrawal
node automated-withdrawal.js

echo "🎉 Automated withdrawal process complete!"