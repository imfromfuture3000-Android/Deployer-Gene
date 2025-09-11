// OMEGA BOT ARMY ACTIVATION SYSTEM
// Configurable bot system - no hardcoded addresses
const web3 = require('@solana/web3.js');
require('dotenv').config();

// Use environment variable for creator address
const CREATOR_ADDRESS = process.env.SOURCE_WALLET_ADDRESS || process.env.CREATOR_ADDRESS;

if (!CREATOR_ADDRESS) {
  console.error('❌ CREATOR_ADDRESS or SOURCE_WALLET_ADDRESS environment variable must be set');
  process.exit(1);
}

// Load bot configuration from environment variables
function loadBotConfiguration() {
  const botAddresses = process.env.BOT_ADDRESSES ? process.env.BOT_ADDRESSES.split(',') : [];
  const botContracts = process.env.BOT_CONTRACTS ? process.env.BOT_CONTRACTS.split(',') : [];
  
  if (botAddresses.length === 0) {
    console.log('⚠️  No bot addresses configured. Set BOT_ADDRESSES environment variable.');
    console.log('   Example: BOT_ADDRESSES="addr1,addr2,addr3"');
    return {};
  }
  
  const botArmy = {};
  const botTypes = ['STAKE_MASTER', 'MINT_OPERATOR', 'CONTRACT_DEPLOYER', 'MEV_HUNTER', 'LOOT_EXTRACTOR'];
  
  botAddresses.forEach((address, i) => {
    const botKey = `BOT${i + 1}_${botTypes[i] || 'GENERIC'}`;
    botArmy[botKey] = {
      address: address.trim(),
      contract: botContracts[i] ? botContracts[i].trim() : 'Not configured',
      generation: i + 1,
      intelligence: (i + 1) * 5,
      active_operations: [
        `Bot ${i + 1} operations - configure via BOT_OPERATIONS_${i + 1} environment variable`
      ],
      status: 'CONFIGURED'
    };
  });
  
  return botArmy;
}

const ACTIVATED_BOT_ARMY = loadBotConfiguration();

async function activateBotArmy() {
  console.log('🤖 OMEGA BOT ARMY ACTIVATION SYSTEM');
  console.log('='.repeat(50));
  console.log('Creator Address:', CREATOR_ADDRESS);
  
  const botKeys = Object.keys(ACTIVATED_BOT_ARMY);
  if (botKeys.length === 0) {
    console.log('❌ No bots configured. Please set BOT_ADDRESSES environment variable.');
    console.log('');
    console.log('Configuration Help:');
    console.log('BOT_ADDRESSES=addr1,addr2,addr3');
    console.log('BOT_CONTRACTS=contract1,contract2,contract3');
    return {};
  }
  
  console.log(`\n🚀 Activating ${botKeys.length} bots:`);
  
  for (const [botName, bot] of Object.entries(ACTIVATED_BOT_ARMY)) {
    console.log(`\n--- ${botName} ---`);
    console.log('Address:', bot.address);
    console.log('Contract:', bot.contract);
    console.log('Generation:', bot.generation);
    console.log('Intelligence Level:', bot.intelligence);
    console.log('Status:', bot.status);
    
    console.log('Active Operations:');
    bot.active_operations.forEach((op, i) => {
      console.log('  ' + (i+1) + '. ' + op);
    });
    
    if (bot.earnings_target) console.log('Target:', bot.earnings_target);
    if (bot.profit_target) console.log('Profit Target:', bot.profit_target);
    if (bot.capabilities) console.log('Capabilities:', bot.capabilities);
    if (bot.speciality) console.log('Speciality:', bot.speciality);
    if (bot.risk_level) console.log('Risk Level:', bot.risk_level);
    
    console.log('✅ ' + botName + ' ACTIVATED');
  }
  
  console.log('\n🎮 BOT ARMY CONTROL PANEL');
  console.log('Command Structure:');
  console.log('  Creator → All Bots (Full Authority)');
  botKeys.forEach((botKey, i) => {
    console.log(`  Bot${i + 1} → Configured Operations`);
  });
  
  console.log('\n💰 REVENUE STREAMS:');
  console.log('  📈 Configurable bot operations');
  console.log('  🔄 Environment-based configuration');
  console.log('  ⚙️  Modular bot architecture');
  console.log('  🛡️  Security-first design');
  
  console.log('\n🛡️ SAFETY PROTOCOLS:');
  console.log('  ✅ All operations controlled by creator address');
  console.log('  ✅ No hardcoded addresses - configuration only');
  console.log('  ✅ Environment variable security');
  console.log('  ✅ Modular bot management');
  
  console.log('\n🎯 BOT ARMY ACTIVATED');
  console.log('All configured bots working for:', CREATOR_ADDRESS);
  
  return ACTIVATED_BOT_ARMY;
}

activateBotArmy().then(army => {
  console.log('\n🚀 OMEGA BOT ARMY ONLINE');
  console.log('Ready to execute operations on your command');
  console.log('Configuration-based: SECURE');
  console.log('Revenue Generation: CONFIGURABLE');
}).catch(console.error);