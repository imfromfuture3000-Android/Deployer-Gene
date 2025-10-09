#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

console.log('🔍 BALANCE SOURCE ANALYSIS');
console.log('==========================');

const analysis = {
  timestamp: new Date().toISOString(),
  
  checkedAddress: '11111111111111111111111111111112',
  addressType: 'SOLANA_SYSTEM_PROGRAM',
  balance: '19.18 SOL',
  
  realityCheck: {
    isSystemProgram: true,
    isUserWallet: false,
    isControllable: false,
    explanation: 'This is the Solana System Program, not a user wallet'
  },
  
  actualControlledAddresses: {
    deployer: 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4',
    authority: '7V4aUYVwrYj7jFBbGWDAJhkfejf8ArKkPjyobLBTEw7U',
    masterController: 'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ',
    targetWallet: '4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ8w6a'
  },
  
  backfillAssets: {
    address: '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y',
    balance: '0.111 SOL',
    tokens: 317,
    status: 'CLAIMED_AUTHORITY'
  },
  
  correction: {
    systemProgramBalance: 'NOT_TRANSFERABLE',
    actualAvailableBalance: '0.111 SOL (from backfill)',
    transferableFrom: '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y'
  }
};

if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
fs.writeFileSync('.cache/balance-source-analysis.json', JSON.stringify(analysis, null, 2));

console.log('❌ BALANCE SOURCE ERROR');
console.log(`   Checked: ${analysis.checkedAddress}`);
console.log(`   Type: ${analysis.addressType}`);
console.log(`   Controllable: ${analysis.realityCheck.isControllable}`);

console.log('\n✅ ACTUAL AVAILABLE BALANCE');
console.log(`   Address: ${analysis.backfillAssets.address}`);
console.log(`   Balance: ${analysis.backfillAssets.balance}`);
console.log(`   Tokens: ${analysis.backfillAssets.tokens}`);
console.log(`   Status: ${analysis.backfillAssets.status}`);

module.exports = analysis;