#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

async function scanProgramTransactions() {
  const deployer = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
  const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5';
  
  console.log('🔍 PROGRAM TRANSACTION SCANNER');
  console.log(`👤 Deployer: ${deployer}\n`);

  const connection = new Connection(rpcUrl, 'confirmed');
  const pubkey = new PublicKey(deployer);

  const results = {
    timestamp: new Date().toISOString(),
    deployer,
    transactions: [],
    programs: new Set(),
    mevRebates: [],
    totalTxs: 0
  };

  try {
    console.log('📡 Fetching transaction signatures...');
    const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 1000 });
    results.totalTxs = signatures.length;
    console.log(`✅ Found ${signatures.length} transactions\n`);

    for (let i = 0; i < Math.min(signatures.length, 50); i++) {
      const sig = signatures[i];
      console.log(`🔍 ${i + 1}/${Math.min(signatures.length, 50)} ${sig.signature.slice(0, 16)}...`);
      
      try {
        const tx = await connection.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 });
        
        if (tx?.meta && tx.transaction) {
          const programs = tx.transaction.message.instructions
            .map(ix => ix.programId?.toString())
            .filter(Boolean);
          
          programs.forEach(p => results.programs.add(p));

          const preBalance = tx.meta.preBalances[0] || 0;
          const postBalance = tx.meta.postBalances[0] || 0;
          const netChange = (postBalance - preBalance) / 1e9;

          if (netChange > 0) {
            results.mevRebates.push({
              signature: sig.signature,
              slot: sig.slot,
              netChange,
              programs
            });
            console.log(`   💰 MEV/Rebate: +${netChange} SOL`);
          }

          results.transactions.push({
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            programs,
            netChange
          });
        }
        
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        console.log(`   ⚠️  ${e.message}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Transactions: ${results.totalTxs}`);
    console.log(`Scanned: ${results.transactions.length}`);
    console.log(`Unique Programs: ${results.programs.size}`);
    console.log(`MEV/Rebates Found: ${results.mevRebates.length}`);
    console.log(`Total Rebate Amount: ${results.mevRebates.reduce((a, b) => a + b.netChange, 0).toFixed(9)} SOL`);

    const output = {
      ...results,
      programs: Array.from(results.programs)
    };

    fs.writeFileSync('.cache/program-transactions.json', JSON.stringify(output, null, 2));
    console.log('\n✅ Saved to .cache/program-transactions.json');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

scanProgramTransactions().catch(console.error);
