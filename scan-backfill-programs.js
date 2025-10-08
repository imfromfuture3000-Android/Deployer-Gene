#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

async function scanBackfillPrograms() {
  const target = '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y';
  const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5';
  
  console.log('🔍 BACKFILL PROGRAM SCANNER');
  console.log(`🎯 Target: ${target}\n`);

  const connection = new Connection(rpcUrl, 'confirmed');
  const pubkey = new PublicKey(target);

  const results = {
    timestamp: new Date().toISOString(),
    target,
    programs: new Set(),
    mevRebates: [],
    feePayers: new Set(),
    totalTxs: 0
  };

  try {
    const sigs = await connection.getSignaturesForAddress(pubkey, { limit: 1000 });
    results.totalTxs = sigs.length;
    console.log(`📡 Found ${sigs.length} transactions\n`);

    for (let i = 0; i < Math.min(sigs.length, 100); i++) {
      const sig = sigs[i];
      
      try {
        const tx = await connection.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 });
        
        if (tx?.meta && tx.transaction) {
          const programs = tx.transaction.message.instructions
            .map(ix => ix.programId?.toString())
            .filter(Boolean);
          
          programs.forEach(p => results.programs.add(p));

          const feePayer = tx.transaction.message.accountKeys[0]?.pubkey?.toString();
          if (feePayer) results.feePayers.add(feePayer);

          const preBalance = tx.meta.preBalances[0] || 0;
          const postBalance = tx.meta.postBalances[0] || 0;
          const netChange = (postBalance - preBalance) / 1e9;

          if (netChange > 0) {
            results.mevRebates.push({
              signature: sig.signature,
              netChange,
              feePayer,
              programs
            });
          }
        }
        
        if (i % 10 === 0) console.log(`🔍 Scanned ${i + 1}/${Math.min(sigs.length, 100)}`);
        await new Promise(r => setTimeout(r, 50));
      } catch (e) {}
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Transactions: ${results.totalTxs}`);
    console.log(`Unique Programs: ${results.programs.size}`);
    console.log(`Unique Fee Payers: ${results.feePayers.size}`);
    console.log(`MEV/Rebates: ${results.mevRebates.length}`);
    console.log(`Total Rebate: ${results.mevRebates.reduce((a, b) => a + b.netChange, 0).toFixed(9)} SOL`);

    const output = {
      ...results,
      programs: Array.from(results.programs),
      feePayers: Array.from(results.feePayers)
    };

    fs.writeFileSync('.cache/backfill-programs.json', JSON.stringify(output, null, 2));
    console.log('\n✅ Saved to .cache/backfill-programs.json');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

scanBackfillPrograms().catch(console.error);
