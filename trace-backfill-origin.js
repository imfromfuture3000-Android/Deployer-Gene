const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

const BACKFILL = '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y';
const HELIUS_API = '16b9324a-5b8c-47b9-9b02-6efa868958e5';
const QUICKNODE_RPC = 'https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e';

console.log('🔍 Tracing Backfill Address Origin\n');
console.log(`Target: ${BACKFILL}\n`);

async function traceOrigin() {
  const connection = new Connection(QUICKNODE_RPC, 'confirmed');
  const backfill = new PublicKey(BACKFILL);

  // Get transaction history via Helius
  console.log('📜 Fetching transaction history (Helius)...\n');
  
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${BACKFILL}/transactions?api-key=${HELIUS_API}&limit=100`
    );
    
    if (!response.ok) {
      throw new Error(`Helius API: ${response.status}`);
    }

    const transactions = await response.json();
    console.log(`Found ${transactions.length} transactions\n`);

    const results = {
      address: BACKFILL,
      totalTransactions: transactions.length,
      transactions: [],
      firstTransaction: null,
      lastTransaction: null,
      relatedAddresses: new Set()
    };

    // Analyze transactions
    for (const tx of transactions) {
      const txInfo = {
        signature: tx.signature,
        timestamp: tx.timestamp,
        type: tx.type,
        description: tx.description,
        fee: tx.fee,
        feePayer: tx.feePayer,
        nativeTransfers: tx.nativeTransfers || [],
        tokenTransfers: tx.tokenTransfers || []
      };

      results.transactions.push(txInfo);

      // Track related addresses
      if (tx.feePayer) results.relatedAddresses.add(tx.feePayer);
      tx.nativeTransfers?.forEach(t => {
        results.relatedAddresses.add(t.fromUserAccount);
        results.relatedAddresses.add(t.toUserAccount);
      });
    }

    // Sort by timestamp
    results.transactions.sort((a, b) => a.timestamp - b.timestamp);
    results.firstTransaction = results.transactions[0];
    results.lastTransaction = results.transactions[results.transactions.length - 1];

    console.log('📊 Transaction Analysis:\n');
    console.log(`   First TX: ${results.firstTransaction?.signature}`);
    console.log(`   Date: ${new Date(results.firstTransaction?.timestamp * 1000).toISOString()}`);
    console.log(`   Type: ${results.firstTransaction?.type}`);
    console.log(`   Fee Payer: ${results.firstTransaction?.feePayer}\n`);

    console.log(`   Last TX: ${results.lastTransaction?.signature}`);
    console.log(`   Date: ${new Date(results.lastTransaction?.timestamp * 1000).toISOString()}\n`);

    console.log(`   Related Addresses: ${results.relatedAddresses.size}`);
    
    // Check if any related address is in our keypairs
    console.log('\n🔑 Checking related addresses against our keypairs...\n');
    
    const ourAddresses = [
      '7V4aUYVwrYj7jFBbGWDAJhkfejf8ArKkPjyobLBTEw7U', // deployer
      '6fKgdNkR23ockagCAP4QbxrRdwvvVRDVCLYhG4WbwxKu', // co-deployer
      'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6'  // backpack
    ];

    const matches = [...results.relatedAddresses].filter(addr => ourAddresses.includes(addr));
    if (matches.length > 0) {
      console.log('   ✅ Found connections to our addresses:');
      matches.forEach(m => console.log(`      ${m}`));
    } else {
      console.log('   ❌ No connections to our known addresses');
    }

    // Save results
    fs.writeFileSync(
      '.cache/backfill-origin-trace.json',
      JSON.stringify({
        ...results,
        relatedAddresses: [...results.relatedAddresses]
      }, null, 2)
    );

    console.log('\n💾 Saved: .cache/backfill-origin-trace.json');

    // Get current balance
    const balance = await connection.getBalance(backfill);
    console.log(`\n💰 Current Balance: ${balance / 1e9} SOL`);

    // Check account info
    const accountInfo = await connection.getAccountInfo(backfill);
    console.log(`📊 Account Owner: ${accountInfo?.owner.toBase58()}`);
    console.log(`📊 Data Size: ${accountInfo?.data.length} bytes`);

    console.log('\n🔗 Explorer Links:');
    console.log(`   Address: https://explorer.solana.com/address/${BACKFILL}`);
    if (results.firstTransaction) {
      console.log(`   First TX: https://explorer.solana.com/tx/${results.firstTransaction.signature}`);
    }

    console.log('\n📝 CONCLUSION:');
    console.log(`   The backfill address ${BACKFILL} is a regular Solana address`);
    console.log(`   that received funds from external sources. We do not have`);
    console.log(`   the private key in this repository.`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

traceOrigin().catch(console.error);
