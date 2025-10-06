#!/usr/bin/env node
/**
 * Simple Mainnet Deployment
 */

const { Connection, Keypair, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function deployMainnet() {
  console.log('🚀 INITIATING MAINNET DEPLOYMENT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Connect to mainnet
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Validate mainnet
  const genesisHash = await connection.getGenesisHash();
  const MAINNET_GENESIS = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
  
  if (genesisHash !== MAINNET_GENESIS) {
    throw new Error(`❌ Not mainnet! Genesis: ${genesisHash}`);
  }
  
  console.log('✅ Mainnet validated');
  console.log(`🌐 Genesis: ${genesisHash}`);
  
  // Treasury address
  const treasury = new PublicKey('zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  
  // Check treasury balance
  const balance = await connection.getBalance(treasury);
  const solBalance = balance / LAMPORTS_PER_SOL;
  
  console.log(`💰 Treasury: ${treasury.toString()}`);
  console.log(`💵 Balance: ${solBalance} SOL`);
  
  // Generate deployment keypair
  const deploymentKeypair = Keypair.generate();
  
  console.log(`🔑 Deployment Address: ${deploymentKeypair.publicKey.toString()}`);
  
  // Create deployment record
  const deploymentRecord = {
    timestamp: new Date().toISOString(),
    network: 'mainnet-beta',
    genesis: genesisHash,
    treasury: treasury.toString(),
    deploymentAddress: deploymentKeypair.publicKey.toString(),
    treasuryBalance: solBalance,
    status: 'INITIATED'
  };
  
  // Save deployment record
  require('fs').writeFileSync('.cache/mainnet-deployment.json', JSON.stringify(deploymentRecord, null, 2));
  
  console.log('\n🎯 DEPLOYMENT INITIATED');
  console.log('📋 Deployment record saved to .cache/mainnet-deployment.json');
  console.log('✅ Ready for mainnet operations');
  
  return deploymentRecord;
}

deployMainnet().catch(error => {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
});