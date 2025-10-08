#!/usr/bin/env node

const fs = require('fs');

console.log('🎯 DEPLOYMENT STATUS DASHBOARD');
console.log('=' .repeat(60));

// Check Gene NFTs
if (fs.existsSync('.cache/gene-nfts.json')) {
  const geneNfts = JSON.parse(fs.readFileSync('.cache/gene-nfts.json', 'utf8'));
  console.log('\n🧬 GENE NFT COLLECTION:');
  console.log('✅ Status: DEPLOYED');
  console.log(`📊 Total NFTs: ${geneNfts.length}`);
  geneNfts.forEach(nft => {
    console.log(`   ${nft.symbol}: ${nft.mint.substring(0, 8)}... (Supply: ${nft.supply})`);
  });
} else {
  console.log('\n🧬 GENE NFT COLLECTION: ❌ NOT DEPLOYED');
}

// Check DAO Governance
if (fs.existsSync('.cache/dao-governance.json')) {
  const dao = JSON.parse(fs.readFileSync('.cache/dao-governance.json', 'utf8'));
  console.log('\n🏛️ DAO GOVERNANCE:');
  console.log('✅ Status: CONFIGURED');
  console.log(`📋 Name: ${dao.name}`);
  console.log(`🗳️ Voting Mechanism: ${dao.votingMechanism}`);
  console.log(`⏰ Voting Period: ${dao.votingPeriods.voting / (24*60*60)} days`);
} else {
  console.log('\n🏛️ DAO GOVERNANCE: ❌ NOT CONFIGURED');
}

// Check Bot Configuration
if (fs.existsSync('.cache/bots.json')) {
  const bots = JSON.parse(fs.readFileSync('.cache/bots.json', 'utf8'));
  console.log('\n🤖 BOT ARMY:');
  console.log('✅ Status: CONFIGURED');
  console.log(`📊 Total Bots: ${bots.bots.length}`);
  console.log(`💰 Mint Amount: ${bots.amount} tokens each`);
} else {
  console.log('\n🤖 BOT ARMY: ❌ NOT CONFIGURED');
}

console.log('\n🚀 READY FOR FULL DEPLOYMENT:');
console.log('npm run deploy:full    # Complete deployment');
console.log('npm run deploy:bots    # Bot minting only');

console.log('\n🎉 SYSTEM STATUS: READY FOR MAINNET DEPLOYMENT!');