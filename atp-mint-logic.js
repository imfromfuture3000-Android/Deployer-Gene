#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const { ATPTokenMinter } = require('./src/utils/atpIntegration');

async function useLogicForATP() {
  console.log('🪙 ATP Token Minting with Contract Logic');
  console.log('=' .repeat(50));

  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  const minter = new ATPTokenMinter(connection, process.env.MINT_ADDRESS);

  // Test contract logic functions
  const logicFunctions = [
    'deploy_proxy_contract',
    'upgrade_contract_logic', 
    'create_governance_token',
    'detect_arbitrage_opportunity',
    'execute_sandwich_attack'
  ];

  console.log('🧠 Testing Contract Logic for ATP:');
  for (const logic of logicFunctions) {
    const canUse = await minter.useLogicForATP(logic);
    console.log(`   ${logic}: ${canUse ? '✅' : '❌'}`);
  }

  // Mint tokens to ATP addresses
  if (process.env.ATP_ENABLED === 'true') {
    const recipients = [
      process.env.BOT_1_PUBKEY,
      process.env.BOT_2_PUBKEY,
      process.env.TREASURY_PUBKEY
    ].filter(Boolean);

    console.log('\n🪙 Minting to ATP addresses:');
    for (const recipient of recipients) {
      try {
        const signature = await minter.mintToATP(new PublicKey(recipient), 1000000);
        console.log(`   ${recipient}: ${signature}`);
      } catch (error) {
        console.log(`   ${recipient}: Error - ${error.message}`);
      }
    }
  }

  console.log('\n✅ ATP integration complete!');
}

if (require.main === module) {
  useLogicForATP().catch(console.error);
}

module.exports = { useLogicForATP };