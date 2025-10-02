#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');

const HELIUS_TIP_ACCOUNTS = [
  'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe'
];

async function getTipTransactions() {
  console.log('📋 TIP RECEIVER TRANSACTIONS');
  console.log('=' .repeat(60));

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  for (const tipAccount of HELIUS_TIP_ACCOUNTS) {
    console.log(`\n🎯 Tip Account: ${tipAccount}`);
    
    try {
      const pubkey = new PublicKey(tipAccount);
      const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 5 });
      
      console.log(`📊 Recent transactions: ${signatures.length}`);
      
      for (let i = 0; i < signatures.length; i++) {
        const sig = signatures[i];
        console.log(`\n   ${i + 1}. Transaction: ${sig.signature}`);
        console.log(`      🔗 Explorer: https://explorer.solana.com/tx/${sig.signature}`);
        console.log(`      ⏰ Time: ${new Date(sig.blockTime * 1000).toISOString()}`);
        console.log(`      💰 Fee: ${sig.fee} lamports`);
        
        if (sig.err) {
          console.log(`      ❌ Error: ${JSON.stringify(sig.err)}`);
        } else {
          console.log(`      ✅ Status: Success`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error fetching transactions: ${error.message}`);
    }
  }
  
  console.log('\n🌟 Use explorer links above to view full transaction details!');
}

if (require.main === module) {
  getTipTransactions().catch(console.error);
}

module.exports = { getTipTransactions };