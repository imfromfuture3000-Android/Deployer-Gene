#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

async function verifyWithTxHash() {
  console.log('🔍 VERIFYING DEPLOYMENTS WITH TX HASH');
  console.log('=====================================');

  const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
  
  const addresses = [
    'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', // Gene Mint
    '7V4aUYVwrYj7jFBbGWDAJhkfejf8ArKkPjyobLBTEw7U', // Authority
    'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ'  // Master Controller
  ];

  const verification = {
    timestamp: new Date().toISOString(),
    addresses: []
  };

  for (const address of addresses) {
    try {
      // Get transaction signatures for address
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit: 5 }]
        })
      });

      const data = await response.json();
      const signatures = data.result || [];

      verification.addresses.push({
        address,
        exists: signatures.length > 0,
        recentTxCount: signatures.length,
        latestTx: signatures[0]?.signature || 'NO_TX_FOUND',
        explorer: `https://explorer.solana.com/address/${address}`
      });

      console.log(`\n✅ ${address}`);
      console.log(`   Exists: ${signatures.length > 0 ? 'YES' : 'NO'}`);
      console.log(`   Recent TXs: ${signatures.length}`);
      if (signatures[0]) {
        console.log(`   Latest TX: ${signatures[0].signature}`);
        console.log(`   TX Explorer: https://explorer.solana.com/tx/${signatures[0].signature}`);
      }

    } catch (error) {
      console.log(`❌ ${address}: ${error.message}`);
    }
  }

  if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
  fs.writeFileSync('.cache/tx-hash-verification.json', JSON.stringify(verification, null, 2));

  console.log('\n📊 Verification Complete');
  console.log('   Saved to: .cache/tx-hash-verification.json');

  return verification;
}

if (require.main === module) {
  verifyWithTxHash().catch(console.error);
}

module.exports = { verifyWithTxHash };