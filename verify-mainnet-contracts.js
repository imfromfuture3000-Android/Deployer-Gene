#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');

const ALL_CONTRACT_ADDRESSES = [
  'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR', // Bot 1
  'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d', // Bot 2
  'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA', // Bot 3
  '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41', // Bot 4
  '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw', // Bot 5
  'EAy5Nfn6fhs4ixC4sMcKQYQaoedLokpWqbfDtWURCnk6', // Contract 1
  'HUwjG8LFabw28vJsQNoLXjxuzgdLhjGQw1DHZggzt76',  // Contract 2
  'FZxmYkA6axyK3Njh3YNWXtybw9GgniVrXowS1pAAyrD1', // Contract 3
  '5ynYfAM7KZZXwT4dd2cZQnYhFNy1LUysE8m7Lxzjzh2p', // Contract 4
  'DHBDPUkLLYCRAiyrgFBgvWfevquFkLR1TjGXKD4M4JPD', // Contract 5
  'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ', // Master Controller
  'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6', // Treasury
  '4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a', // Target Wallet
  '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y', // Relayer
  '9HUvuQHBHkihcrhiucdYFjk1q4jUgozakoYsubYrHiJS', // Secondary Wallet
  'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp', // Analysis Target
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter
  'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo', // Meteora
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
];

async function verifyMainnetContracts() {
  console.log('🔍 MAINNET CONTRACT VERIFICATION');
  console.log('=' .repeat(60));

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  console.log(`📊 Total contracts to verify: ${ALL_CONTRACT_ADDRESSES.length}`);
  console.log('🌐 Network: Solana Mainnet-Beta\n');

  let verified = 0;
  let failed = 0;

  for (let i = 0; i < ALL_CONTRACT_ADDRESSES.length; i++) {
    const address = ALL_CONTRACT_ADDRESSES[i];
    
    try {
      const pubkey = new PublicKey(address);
      const accountInfo = await connection.getAccountInfo(pubkey);
      
      if (accountInfo) {
        console.log(`✅ ${i + 1}. ${address} - VERIFIED`);
        console.log(`   Balance: ${accountInfo.lamports} lamports`);
        console.log(`   Owner: ${accountInfo.owner.toString()}`);
        verified++;
      } else {
        console.log(`⚠️  ${i + 1}. ${address} - NO ACCOUNT DATA`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${i + 1}. ${address} - ERROR: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }

  console.log('📈 VERIFICATION SUMMARY:');
  console.log(`   ✅ Verified: ${verified}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Success Rate: ${((verified / ALL_CONTRACT_ADDRESSES.length) * 100).toFixed(1)}%`);
}

if (require.main === module) {
  verifyMainnetContracts().catch(console.error);
}

module.exports = { verifyMainnetContracts };