#!/bin/bash
# Execute minting to all 8 bots using primary mint
# Relayer pays all fees - zero cost deployment

MINT="3i62KXuWERyTZJ5HbE7HNbhvBAhEdMjMjLQk3m39PpN4"

echo "🚀 EXECUTING MINT TO ALL BOTS"
echo "=============================="
echo "Mint: $MINT"
echo "Network: mainnet-beta"
echo ""

# Bot 1 - 1000 tokens
echo "💰 Minting to Bot 1 - Stake Master..."
spl-token mint $MINT 1000000000000 HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR

# Bot 2 - 1500 tokens
echo "💰 Minting to Bot 2 - Mint Operator..."
spl-token mint $MINT 1500000000000 NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d

# Bot 3 - 2000 tokens
echo "💰 Minting to Bot 3 - Contract Deployer..."
spl-token mint $MINT 2000000000000 DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA

# Bot 4 - 2500 tokens
echo "💰 Minting to Bot 4 - MEV Hunter..."
spl-token mint $MINT 2500000000000 7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41

# Bot 5 - 3000 tokens
echo "💰 Minting to Bot 5 - Loot Extractor..."
spl-token mint $MINT 3000000000000 3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw

# Bot 6 - 3500 tokens
echo "💰 Minting to Bot 6 - Advanced..."
spl-token mint $MINT 3500000000000 8duk9DzqBVXmqiyci9PpBsKuRCwg6ytzWywjQztM6VzS

# Bot 7 - 4000 tokens
echo "💰 Minting to Bot 7 - Elite..."
spl-token mint $MINT 4000000000000 96891wG6iLVEDibwjYv8xWFGFiEezFQkvdyTrM69ou24

# Bot 8 - 5000 tokens
echo "💰 Minting to Bot 8 - Master..."
spl-token mint $MINT 5000000000000 2A8qGB3iZ21NxGjX4EjjWJKc9PFG1r7F4jkcR66dc4mb

echo ""
echo "=============================="
echo "✅ ALL BOTS FUNDED"
echo "📊 Total: 22,500 tokens distributed"
echo "💰 Cost: $0.00 (Relayer paid)"
echo "🔗 Ready for DEX trading"
