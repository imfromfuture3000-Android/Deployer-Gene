#!/usr/bin/env node
/**
 * Check Node and Vote Program Addresses
 */

const { Connection, PublicKey } = require('@solana/web3.js');

async function checkNodeVotePrograms() {
  console.log('🗳️ CHECKING NODE AND VOTE PROGRAM ADDRESSES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const yourWallet = new PublicKey('zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  
  // Core Solana program addresses
  const corePrograms = {
    'Vote Program': 'Vote111111111111111111111111111111111111111',
    'Stake Program': 'Stake11111111111111111111111111111111111111',
    'System Program': '11111111111111111111111111111111',
    'Config Program': 'Config1111111111111111111111111111111111111',
    'BPF Loader': 'BPFLoader2111111111111111111111111111111111',
    'BPF Loader Upgradeable': 'BPFLoaderUpgradeab1e11111111111111111111111'
  };

  console.log('🔍 CORE SOLANA PROGRAMS:');
  for (const [name, address] of Object.entries(corePrograms)) {
    console.log(`${name}: ${address}`);
  }

  console.log('\n🗳️ CHECKING VOTE ACCOUNTS...');
  
  try {
    // Get vote accounts
    const voteAccounts = await connection.getVoteAccounts();
    
    console.log(`✅ Found ${voteAccounts.current.length} current vote accounts`);
    console.log(`⚠️ Found ${voteAccounts.delinquent.length} delinquent vote accounts`);
    
    // Check if you have any vote accounts
    let yourVoteAccounts = [];
    
    [...voteAccounts.current, ...voteAccounts.delinquent].forEach(vote => {
      if (vote.nodePubkey === yourWallet.toString()) {
        yourVoteAccounts.push(vote);
      }
    });
    
    if (yourVoteAccounts.length > 0) {
      console.log(`\n✅ YOU HAVE ${yourVoteAccounts.length} VOTE ACCOUNT(S):`);
      yourVoteAccounts.forEach((vote, i) => {
        console.log(`${i + 1}. Vote Account: ${vote.votePubkey}`);
        console.log(`   Node: ${vote.nodePubkey}`);
        console.log(`   Commission: ${vote.commission}%`);
        console.log(`   Active Stake: ${vote.activatedStake / 1e9} SOL`);
      });
    } else {
      console.log('❌ You do not have any vote accounts');
    }
    
  } catch (error) {
    console.log(`❌ Error checking vote accounts: ${error.message}`);
  }

  console.log('\n🔍 CHECKING YOUR STAKE ACCOUNTS...');
  
  try {
    // Get stake accounts for your wallet
    const stakeAccounts = await connection.getParsedProgramAccounts(
      new PublicKey('Stake11111111111111111111111111111111111111'),
      {
        filters: [
          {
            memcmp: {
              offset: 12, // Stake authority offset
              bytes: yourWallet.toBase58()
            }
          }
        ]
      }
    );
    
    if (stakeAccounts.length > 0) {
      console.log(`✅ Found ${stakeAccounts.length} stake account(s):`);
      
      stakeAccounts.forEach((account, i) => {
        const balance = account.account.lamports / 1e9;
        console.log(`${i + 1}. ${account.pubkey.toString()}: ${balance} SOL`);
      });
    } else {
      console.log('❌ No stake accounts found for your wallet');
    }
    
  } catch (error) {
    console.log(`❌ Error checking stake accounts: ${error.message}`);
  }
}

checkNodeVotePrograms();