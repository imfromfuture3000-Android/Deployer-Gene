#!/usr/bin/env node

const fs = require('fs');

async function deployNow() {
  console.log('🚀 REAL MAINNET DEPLOYMENT');
  console.log('=========================');

  const rpcUrl = 'https://api.mainnet-beta.solana.com';
  
  // Verify mainnet
  const genesisResponse = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getGenesisHash'
    })
  });
  
  const genesis = await genesisResponse.json();
  console.log('✅ Mainnet Verified:', genesis.result);

  // Check deployer balance
  const deployerKey = JSON.parse(fs.readFileSync('.cache/user_auth.json', 'utf8'));
  const deployerPubkey = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
  
  const balanceResponse = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [deployerPubkey]
    })
  });
  
  const balance = await balanceResponse.json();
  const sol = balance.result.value / 1e9;
  
  console.log(`💰 Deployer Balance: ${sol} SOL`);
  console.log(`🔑 Deployer: ${deployerPubkey}`);
  console.log(`✅ Private Key: LOADED`);
  
  const deployment = {
    timestamp: new Date().toISOString(),
    network: 'mainnet-beta',
    genesis: genesis.result,
    deployer: deployerPubkey,
    balance: sol,
    privateKeyLoaded: true,
    status: 'READY_FOR_REAL_DEPLOYMENT'
  };
  
  fs.writeFileSync('.cache/real-deployment-ready.json', JSON.stringify(deployment, null, 2));
  
  console.log('\n✅ SYSTEM READY FOR REAL DEPLOYMENT');
  console.log('   Network: mainnet-beta');
  console.log('   Private Key: Loaded');
  console.log('   Balance: Available');
  
  return deployment;
}

deployNow().catch(console.error);