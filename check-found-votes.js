#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');

const VOTE_ACCOUNTS = [
  'CRAXrE1qyxJqV7FDNhcXqKSo7MN6j7gXZSYq7W1VFsT9',
  'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ'
];

const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';

async function checkVotes() {
  console.log('🗳️  CHECKING FOUND VOTE ACCOUNTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

  for (const voteAddr of VOTE_ACCOUNTS) {
    console.log(`🗳️  ${voteAddr}\n`);

    try {
      const accountInfo = await connection.getAccountInfo(new PublicKey(voteAddr));
      
      if (accountInfo) {
        console.log(`   ✅ EXISTS`);
        console.log(`   Balance: ${(accountInfo.lamports / 1e9).toFixed(9)} SOL`);
        console.log(`   Owner: ${accountInfo.owner.toBase58()}`);
        console.log(`   🔗 https://explorer.solana.com/address/${voteAddr}\n`);
      } else {
        console.log(`   ❌ NOT FOUND\n`);
      }
    } catch (e) {
      console.log(`   ⚠️  Error: ${e.message}\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Vote Accounts Found: ${VOTE_ACCOUNTS.length}`);
  console.log(`Destination: ${DESTINATION}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

checkVotes().catch(console.error);
