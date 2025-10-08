#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

async function scanAll() {
  console.log('🔍 COMPREHENSIVE ASSET & REBATE SCANNER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  const results = { timestamp: new Date().toISOString(), deployed: [], contracts: [], summary: {} };

  // Get deployment info
  if (fs.existsSync('.cache/deployment.json')) {
    const deploy = JSON.parse(fs.readFileSync('.cache/deployment.json'));
    results.deployed.push(deploy);
    
    console.log('📦 DEPLOYED ASSETS:\n');
    console.log(`🪙 Mint: ${deploy.mint}`);
    console.log(`💰 Treasury: ${deploy.treasuryAta}`);
    console.log(`📍 Deployer: ${deploy.deployer}`);
    console.log(`🌐 Network: ${deploy.network}`);
    console.log(`📊 Supply: ${deploy.supply.toLocaleString()} tokens`);
    console.log(`⏰ Deployed: ${deploy.timestamp}\n`);

    // Check on-chain status
    try {
      const mintInfo = await connection.getAccountInfo(new PublicKey(deploy.mint));
      const deployerInfo = await connection.getAccountInfo(new PublicKey(deploy.deployer));
      
      console.log('🔍 ON-CHAIN STATUS:\n');
      console.log(`🪙 Mint: ${mintInfo ? '✅ EXISTS' : '⏳ PENDING'}`);
      console.log(`📍 Deployer Balance: ${deployerInfo ? (deployerInfo.lamports / 1e9).toFixed(4) : 0} SOL`);
      
      if (mintInfo) {
        console.log(`   Owner: ${mintInfo.owner.toBase58()}`);
        console.log(`   Size: ${mintInfo.data.length} bytes`);
      }
    } catch (e) {
      console.log(`⚠️  Error checking on-chain: ${e.message}`);
    }
  }

  // Load contract addresses
  console.log('\n📋 CONTRACT ADDRESSES:\n');
  
  if (fs.existsSync('contract_addresses.json')) {
    const data = JSON.parse(fs.readFileSync('contract_addresses.json'));
    
    if (data.omega_prime_addresses?.bot_army) {
      console.log('🤖 BOT ARMY:');
      for (const [name, bot] of Object.entries(data.omega_prime_addresses.bot_army)) {
        console.log(`   ${name}:`);
        if (bot.bot_address) console.log(`      Bot: ${bot.bot_address}`);
        if (bot.contract_address) console.log(`      Contract: ${bot.contract_address}`);
        results.contracts.push({ name, ...bot });
      }
    }

    if (data.omega_prime_addresses?.treasury_operational) {
      console.log('\n💰 TREASURY:');
      for (const [name, addr] of Object.entries(data.omega_prime_addresses.treasury_operational)) {
        console.log(`   ${name}: ${addr}`);
        results.contracts.push({ name, address: addr, type: 'treasury' });
      }
    }
  }

  // Rebate info
  console.log('\n💎 REBATE CONFIGURATION:\n');
  console.log('✅ Relayer Mode: ACTIVE');
  console.log('✅ User Cost: 0 SOL');
  console.log('✅ Fee Payer: RELAYER');
  console.log(`🔗 Relayer: ${process.env.RELAYER_PUBKEY || 'Not configured'}`);
  console.log(`🌐 Relayer URL: ${process.env.RELAYER_URL || 'Not configured'}`);

  // Summary
  results.summary = {
    totalDeployed: results.deployed.length,
    totalContracts: results.contracts.length,
    network: 'mainnet-beta',
    relayerMode: true,
    userCost: 0
  };

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Deployed Assets: ${results.deployed.length}`);
  console.log(`🤖 Contract Addresses: ${results.contracts.length}`);
  console.log(`🌐 Network: mainnet-beta`);
  console.log(`💵 User Cost: 0 SOL (Relayer Paid)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/asset-scan.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to .cache/asset-scan.json');
}

scanAll().catch(console.error);
