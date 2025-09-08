#!/bin/bash

# Security fix script to replace hardcoded API keys and addresses
# This script updates multiple files to use environment variables

echo "🔒 Starting security fix for hardcoded secrets..."

# Array of files that contain hardcoded secrets
files=(
    "execute-funding-and-minting.js"
    "detailed-query.js"
    "check-authority.js"
    "secure-addresses.js"
    "check-address.js"
    "deploy-with-mint.js"
    "mint-to-address.js"
    "omega-deploy-transfer.js"
    "fund-target-address.js"
    "address-security-report.js"
)

# Function to add require('dotenv').config() if not present
add_dotenv() {
    local file="$1"
    if ! grep -q "require('dotenv')" "$file" 2>/dev/null; then
        if grep -q "const web3 = require" "$file" 2>/dev/null; then
            sed -i "s/const web3 = require('@solana\/web3.js');/const web3 = require('@solana\/web3.js');\nrequire('dotenv').config();/" "$file"
        fi
    fi
}

# Function to replace hardcoded API key
replace_api_key() {
    local file="$1"
    if [[ -f "$file" ]]; then
        echo "  Fixing API key in $file"
        
        # Add dotenv config
        add_dotenv "$file"
        
        # Replace hardcoded Helius API key with environment variable
        sed -i "s|https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5|process.env.HELIUS_API_KEY ? \`https://mainnet.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}\` : (process.env.RPC_URL || 'https://api.mainnet-beta.solana.com')|g" "$file"
    fi
}

# Function to replace hardcoded wallet addresses
replace_addresses() {
    local file="$1"
    if [[ -f "$file" ]]; then
        echo "  Fixing wallet addresses in $file"
        
        # Replace hardcoded source address
        sed -i "s/'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ'/process.env.SOURCE_WALLET_ADDRESS/g" "$file"
        sed -i "s/\"CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ\"/process.env.SOURCE_WALLET_ADDRESS/g" "$file"
        
        # Replace hardcoded target address  
        sed -i "s/'4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a'/process.env.TARGET_WALLET_ADDRESS/g" "$file"
        sed -i "s/\"4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a\"/process.env.TARGET_WALLET_ADDRESS/g" "$file"
    fi
}

# Process each file
for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "📝 Processing $file..."
        replace_api_key "$file"
        replace_addresses "$file"
    else
        echo "⚠️  File $file not found, skipping..."
    fi
done

echo "✅ Security fix completed!"
echo "🔍 Please verify the changes and test the applications"
echo "⚠️  Don't forget to set up your .env file with real values"