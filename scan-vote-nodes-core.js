#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey, VoteProgram, VOTE_PROGRAM_ID } = require('@solana/web3.js');
const fs = require('fs');

const CORE_PROGRAMS = {
  vote: 'Vote111111111111111111111111111111111111111',
  stake: 'Stake11111111111111111111111111111111111111',
  system: '11111111111111111111111111111111',
  token: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  associated_token: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  bpf_loader: 'BPFLoaderUpgradeab1e11111111111111111111111'
};

async function scanVoteNodes() {
  console.log('🗳️  VOTE NODE & CORE PROGRAM SCANNER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  const results = { timestamp: new Date().toISOString(), corePrograms: [], voteAccounts: [], transferReady: [] };

  // Check core programs
  console.log('🔍 SCANNING CORE SOLANA PROGRAMS:\n');
  
  for (const [name, address] of Object.entries(CORE_PROGRAMS)) {
    try {
      const pubkey = new PublicKey(address);
      const accountInfo = await connection.getAccountInfo(pubkey);
      
      const programData = {
        name,
        address,
        exists: !!accountInfo,
        executable: accountInfo?.executable || false,
        owner: accountInfo?.owner.toBase58() || 'N/A',
        lamports: accountInfo ? accountInfo.lamports / 1e9 : 0
      };

      results.corePrograms.push(programData);
      console.log(`${programData.exists ? '✅' : '❌'} ${name.toUpperCase()}`);
      console.log(`   Address: ${address}`);
      console.log(`   Executable: ${programData.executable}`);
      console.log(`   Balance: ${programData.lamports.toFixed(4)} SOL\n`);

    } catch (e) {
      console.log(`⚠️  ${name}: ${e.message}\n`);
    }
  }

  // Get vote accounts
  console.log('🗳️  SCANNING VOTE ACCOUNTS:\n');
  
  try {
    const voteAccounts = await connection.getVoteAccounts();
    
    console.log(`📊 Total Vote Accounts: ${voteAccounts.current.length + voteAccounts.delinquent.length}`);
    console.log(`✅ Active: ${voteAccounts.current.length}`);
    console.log(`⚠️  Delinquent: ${voteAccounts.delinquent.length}\n`);

    // Sample top 5 active validators
    console.log('🏆 TOP 5 ACTIVE VALIDATORS:\n');
    voteAccounts.current.slice(0, 5).forEach((vote, i) => {
      console.log(`${i + 1}. ${vote.nodePubkey}`);
      console.log(`   Vote Account: ${vote.votePubkey}`);
      console.log(`   Commission: ${vote.commission}%`);
      console.log(`   Activated Stake: ${(vote.activatedStake / 1e9).toFixed(2)} SOL\n`);
      
      results.voteAccounts.push({
        rank: i + 1,
        nodePubkey: vote.nodePubkey,
        votePubkey: vote.votePubkey,
        commission: vote.commission,
        activatedStake: vote.activatedStake / 1e9,
        status: 'active'
      });
    });

  } catch (e) {
    console.log(`⚠️  Vote accounts: ${e.message}\n`);
  }

  // Check our contracts for transfer readiness
  console.log('🔄 CHECKING TRANSFER READINESS:\n');

  const ourContracts = [];
  
  // Load our contracts
  if (fs.existsSync('contract_addresses.json')) {
    const data = JSON.parse(fs.readFileSync('contract_addresses.json'));
    if (data.omega_prime_addresses?.bot_army) {
      Object.values(data.omega_prime_addresses.bot_army).forEach(bot => {
        if (bot.contract_address) ourContracts.push(bot.contract_address);
      });
    }
  }

  // Check deployment
  if (fs.existsSync('.cache/deployment.json')) {
    const deploy = JSON.parse(fs.readFileSync('.cache/deployment.json'));
    ourContracts.push(deploy.mint, deploy.deployer);
  }

  for (const addr of ourContracts.slice(0, 5)) {
    try {
      const pubkey = new PublicKey(addr);
      const accountInfo = await connection.getAccountInfo(pubkey);
      
      const transferReady = {
        address: addr,
        exists: !!accountInfo,
        balance: accountInfo ? accountInfo.lamports / 1e9 : 0,
        owner: accountInfo?.owner.toBase58() || 'N/A',
        canTransfer: accountInfo && accountInfo.lamports > 0,
        status: accountInfo ? (accountInfo.lamports > 0 ? 'READY' : 'EMPTY') : 'NOT_FOUND'
      };

      results.transferReady.push(transferReady);
      
      const icon = transferReady.canTransfer ? '✅' : (transferReady.exists ? '⚠️' : '❌');
      console.log(`${icon} ${addr.slice(0, 8)}...`);
      console.log(`   Status: ${transferReady.status}`);
      console.log(`   Balance: ${transferReady.balance.toFixed(4)} SOL`);
      console.log(`   Owner: ${transferReady.owner.slice(0, 8)}...\n`);

    } catch (e) {
      console.log(`⚠️  ${addr.slice(0, 8)}...: ${e.message}\n`);
    }
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Core Programs Verified: ${results.corePrograms.filter(p => p.exists).length}/${results.corePrograms.length}`);
  console.log(`🗳️  Active Vote Accounts: ${results.voteAccounts.length}`);
  console.log(`🔄 Contracts Checked: ${results.transferReady.length}`);
  console.log(`💰 Transfer Ready: ${results.transferReady.filter(c => c.canTransfer).length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/vote-node-scan.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to .cache/vote-node-scan.json');
}

scanVoteNodes().catch(console.error);
