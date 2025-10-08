#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const { getMint } = require('@solana/spl-token');
const fs = require('fs');

async function verify() {
  console.log('🔍 DEPLOYMENT VERIFICATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  if (!fs.existsSync('.cache/deployment.json')) {
    console.log('❌ No deployment found');
    return;
  }

  const deployment = JSON.parse(fs.readFileSync('.cache/deployment.json'));
  const mintPubkey = new PublicKey(deployment.mint);

  console.log('📋 Deployment Info:');
  console.log(`🪙 Mint: ${deployment.mint}`);
  console.log(`💰 Treasury: ${deployment.treasuryAta}`);
  console.log(`📍 Deployer: ${deployment.deployer}`);
  console.log(`🌐 Network: ${deployment.network}`);
  console.log(`⏰ Timestamp: ${deployment.timestamp}\n`);

  try {
    console.log('🔍 Checking on-chain status...\n');
    
    const accountInfo = await connection.getAccountInfo(mintPubkey);
    
    if (accountInfo) {
      console.log('✅ MINT EXISTS ON-CHAIN');
      console.log(`📊 Account Owner: ${accountInfo.owner.toBase58()}`);
      console.log(`💾 Data Size: ${accountInfo.data.length} bytes`);
      console.log(`🔒 Executable: ${accountInfo.executable}`);
      
      try {
        const mintInfo = await getMint(connection, mintPubkey);
        console.log('\n📊 MINT DETAILS:');
        console.log(`🔢 Decimals: ${mintInfo.decimals}`);
        console.log(`📈 Supply: ${Number(mintInfo.supply) / 10**mintInfo.decimals}`);
        console.log(`👤 Mint Authority: ${mintInfo.mintAuthority?.toBase58() || 'LOCKED'}`);
        console.log(`❄️  Freeze Authority: ${mintInfo.freezeAuthority?.toBase58() || 'LOCKED'}`);
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ VERIFICATION COMPLETE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🔗 Explorer: https://explorer.solana.com/address/${deployment.mint}`);
        console.log(`🔗 Solscan: https://solscan.io/token/${deployment.mint}`);
        
      } catch (e) {
        console.log('\n⚠️  Mint account exists but not initialized yet');
        console.log('📋 Status: Prepared for deployment');
        console.log('⏳ Waiting for relayer to execute transactions');
      }
      
    } else {
      console.log('⏳ MINT NOT YET DEPLOYED');
      console.log('📋 Status: Prepared');
      console.log('🔄 Next: Relayer will execute deployment');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

verify().catch(console.error);
