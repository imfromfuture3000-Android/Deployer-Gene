#!/usr/bin/env node

const https = require('https');

const DEPLOYER = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
const HELIUS_RPC = 'https://api.mainnet-beta.solana.com';

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function checkHeliusTransactions() {
  console.log('🔍 HELIUS RPC TRANSACTION CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Address:', DEPLOYER);
  
  try {
    // Get signatures for address
    const sigResponse = await makeRequest(HELIUS_RPC, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [DEPLOYER, { limit: 10 }]
    });

    const signatures = sigResponse.result || [];
    console.log('📊 Found', signatures.length, 'recent transactions');

    if (signatures.length === 0) {
      console.log('❌ No transactions found');
      return;
    }

    console.log('\n📝 RECENT TRANSACTIONS:');
    
    for (let i = 0; i < Math.min(5, signatures.length); i++) {
      const sig = signatures[i];
      console.log(`\n${i + 1}. ${sig.signature.substring(0, 20)}...`);
      console.log(`   Slot: ${sig.slot}`);
      console.log(`   Status: ${sig.err ? 'FAILED' : 'SUCCESS'}`);
      console.log(`   Block Time: ${new Date(sig.blockTime * 1000).toISOString()}`);

      // Get transaction details
      try {
        const txResponse = await makeRequest(HELIUS_RPC, {
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [sig.signature, { encoding: 'json' }]
        });

        const tx = txResponse.result;
        if (tx && tx.meta) {
          console.log(`   Fee: ${tx.meta.fee / 1e9} SOL`);
          console.log(`   Instructions: ${tx.transaction.message.instructions.length}`);
          
          // Check for token transfers
          if (tx.meta.postTokenBalances && tx.meta.postTokenBalances.length > 0) {
            console.log(`   Token Operations: ${tx.meta.postTokenBalances.length}`);
          }
        }
      } catch (e) {
        console.log('   Details: Unable to fetch');
      }
    }

    // Summary
    const successful = signatures.filter(s => !s.err).length;
    const failed = signatures.filter(s => s.err).length;
    
    console.log('\n📊 TRANSACTION SUMMARY:');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((successful / signatures.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error checking transactions:', error.message);
  }
}

checkHeliusTransactions();