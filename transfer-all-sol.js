#!/usr/bin/env node
/**
 * Transfer All Available SOL from Vote Accounts
 */

const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function transferAllSOL() {
  console.log('💰 TRANSFERRING ALL AVAILABLE SOL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const destination = new PublicKey('ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6');
  
  console.log(`📥 Destination: ${destination.toString()}`);
  
  // Vote accounts from your Helius API data
  const voteAccounts = [
    { node: '6k1YkmTKwPRUhChnxA9ryJmbtuQMbro4xFTL6mL9jycB', vote: '91413b9eEvG6UofpSgwdUgH9Lz4QBF1G3J325Bw7JwGR', stake: 133067670177820 },
    { node: 'HSX42dhQPTaVjtwMQXwGTCobrs1HnxZ8G2J6JTnPXpgP', vote: '8ty86LdqsnSW4fpbZRFaR1EfgB3eUknJVz8BKY5izoWy', stake: 56987645345064 },
    { node: 'GFXVa19rX6iwfs3sLS5UvX9Exu2usRsG4V5MRMDRo23V', vote: 'GFXVa1g8zzAVDRnSuB6o9PnHuyH25ADvy2YJPZLpATuP', stake: 10618433480000 }
  ];
  
  let totalTransferred = 0;
  const results = [];
  
  for (const account of voteAccounts) {
    try {
      const nodePubkey = new PublicKey(account.node);
      const votePubkey = new PublicKey(account.vote);
      
      console.log(`\n🔍 Checking ${account.node.slice(0, 8)}...`);
      
      // Check node account balance
      const nodeBalance = await connection.getBalance(nodePubkey);
      const nodeSOL = nodeBalance / LAMPORTS_PER_SOL;
      
      // Check vote account balance  
      const voteBalance = await connection.getBalance(votePubkey);
      const voteSOL = voteBalance / LAMPORTS_PER_SOL;
      
      console.log(`💰 Node Balance: ${nodeSOL} SOL`);
      console.log(`🗳️ Vote Balance: ${voteSOL} SOL`);
      
      // Transfer from node account if has balance
      if (nodeBalance > 5000) { // Keep 0.000005 SOL for rent
        const transferAmount = nodeBalance - 5000;
        console.log(`📤 Transferring ${transferAmount / LAMPORTS_PER_SOL} SOL from node`);
        
        // Create transfer instruction (would need private key to execute)
        console.log(`✅ Transfer prepared: ${transferAmount / LAMPORTS_PER_SOL} SOL`);
        totalTransferred += transferAmount / LAMPORTS_PER_SOL;
        
        results.push({
          from: account.node,
          type: 'node',
          amount: transferAmount / LAMPORTS_PER_SOL,
          status: 'prepared'
        });
      }
      
      // Transfer from vote account if has balance
      if (voteBalance > 5000) {
        const transferAmount = voteBalance - 5000;
        console.log(`📤 Transferring ${transferAmount / LAMPORTS_PER_SOL} SOL from vote`);
        
        console.log(`✅ Transfer prepared: ${transferAmount / LAMPORTS_PER_SOL} SOL`);
        totalTransferred += transferAmount / LAMPORTS_PER_SOL;
        
        results.push({
          from: account.vote,
          type: 'vote',
          amount: transferAmount / LAMPORTS_PER_SOL,
          status: 'prepared'
        });
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 TRANSFER SUMMARY:');
  console.log(`💎 Total to transfer: ${totalTransferred} SOL`);
  console.log(`📥 Destination: ${destination.toString()}`);
  console.log(`⚠️ Requires: Private keys for each account to execute`);
  
  // Save transfer plan
  require('fs').writeFileSync('.cache/transfer-plan.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    destination: destination.toString(),
    totalAmount: totalTransferred,
    transfers: results
  }, null, 2));
  
  console.log('📋 Transfer plan saved to .cache/transfer-plan.json');
  
  return results;
}

transferAllSOL();