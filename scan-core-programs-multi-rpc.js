#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const fetch = require('node-fetch');
const fs = require('fs');

const HELIUS_API = process.env.HELIUS_API_KEY;
const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';

async function scanCorePrograms() {
  console.log('🔍 MULTI-RPC CORE PROGRAM SCANNER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const rpcs = [
    { name: 'Public', url: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com' }
  ];

  console.log(`📡 Using ${rpcs.length} RPC endpoint(s)\n`);

  const results = {
    timestamp: new Date().toISOString(),
    destination: DESTINATION,
    addresses: [],
    programs: [],
    voteAccounts: [],
    assets: []
  };

  // Load all addresses from config
  const addresses = [];
  
  if (fs.existsSync('contract_addresses.json')) {
    const data = JSON.parse(fs.readFileSync('contract_addresses.json'));
    
    if (data.omega_prime_addresses?.bot_army) {
      Object.values(data.omega_prime_addresses.bot_army).forEach(bot => {
        if (bot.bot_address) addresses.push(bot.bot_address);
        if (bot.contract_address) addresses.push(bot.contract_address);
      });
    }
    
    if (data.omega_prime_addresses?.treasury_operational) {
      Object.values(data.omega_prime_addresses.treasury_operational).forEach(addr => {
        if (addr && addr !== 'REMOVED') addresses.push(addr);
      });
    }
  }

  // Add deployment addresses
  if (fs.existsSync('.cache/deployment.json')) {
    const deploy = JSON.parse(fs.readFileSync('.cache/deployment.json'));
    addresses.push(deploy.mint, deploy.deployer, deploy.treasuryAta);
  }

  addresses.push(DESTINATION);

  console.log(`📋 Scanning ${addresses.length} addresses\n`);

  // Use Helius for detailed scanning
  const connection = new Connection(rpcs[0].url, 'confirmed');

  for (const addr of addresses) {
    try {
      console.log(`🔍 ${addr.slice(0,8)}...`);
      
      const pubkey = new PublicKey(addr);
      const accountInfo = await connection.getAccountInfo(pubkey);
      
      if (accountInfo) {
        const balance = accountInfo.lamports / 1e9;
        console.log(`   Balance: ${balance.toFixed(9)} SOL`);
        console.log(`   Owner: ${accountInfo.owner.toBase58().slice(0,8)}...`);
        
        results.addresses.push({
          address: addr,
          balance,
          owner: accountInfo.owner.toBase58(),
          executable: accountInfo.executable,
          dataSize: accountInfo.data.length
        });

        // Check if it's a program
        if (accountInfo.executable) {
          console.log(`   ✅ EXECUTABLE PROGRAM`);
          results.programs.push(addr);
        }

        // Check for vote account
        if (accountInfo.owner.toBase58() === 'Vote111111111111111111111111111111111111111') {
          console.log(`   🗳️  VOTE ACCOUNT`);
          results.voteAccounts.push(addr);
        }

        // Use Helius API for enhanced data
        if (HELIUS_API) {
          try {
            const heliusRes = await fetch(
              `https://api.helius.xyz/v0/addresses/${addr}/balances?api-key=${HELIUS_API}`
            );
            
            if (heliusRes.ok) {
              const heliusData = await heliusRes.json();
              if (heliusData.tokens && heliusData.tokens.length > 0) {
                console.log(`   💎 Tokens: ${heliusData.tokens.length}`);
                results.assets.push({
                  address: addr,
                  tokens: heliusData.tokens.length
                });
              }
            }
          } catch (e) {}
        }

      } else {
        console.log(`   ❌ Not found`);
      }
      
      console.log('');
      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}\n`);
    }
  }

  // Get vote accounts from network
  console.log('🗳️  CHECKING NETWORK VOTE ACCOUNTS:\n');
  
  try {
    const voteAccounts = await connection.getVoteAccounts();
    console.log(`Total Active Validators: ${voteAccounts.current.length}`);
    console.log(`Total Delinquent: ${voteAccounts.delinquent.length}\n`);
    
    // Check if any of our addresses are validators
    const ourValidators = voteAccounts.current.filter(v => 
      addresses.includes(v.nodePubkey) || addresses.includes(v.votePubkey)
    );
    
    if (ourValidators.length > 0) {
      console.log(`✅ Found ${ourValidators.length} validator(s) associated with our addresses:\n`);
      ourValidators.forEach(v => {
        console.log(`   Node: ${v.nodePubkey}`);
        console.log(`   Vote: ${v.votePubkey}`);
        console.log(`   Stake: ${(v.activatedStake / 1e9).toFixed(2)} SOL\n`);
      });
    }
    
  } catch (e) {
    console.log(`⚠️  Vote accounts check: ${e.message}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Addresses Scanned: ${results.addresses.length}`);
  console.log(`💰 Total SOL: ${results.addresses.reduce((sum, a) => sum + a.balance, 0).toFixed(9)}`);
  console.log(`🔧 Programs Found: ${results.programs.length}`);
  console.log(`🗳️  Vote Accounts: ${results.voteAccounts.length}`);
  console.log(`💎 Addresses with Tokens: ${results.assets.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/core-program-scan.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to .cache/core-program-scan.json');
}

scanCorePrograms().catch(console.error);
