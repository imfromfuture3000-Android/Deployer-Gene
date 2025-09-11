// 📋 OMEGA PRIME CONTRACT ADDRESS VIEWER
// Display all contract addresses in an organized format
const fs = require('fs');
const path = require('path');

function displayAllContractAddresses() {
  console.log('🏗️ OMEGA PRIME DEPLOYER - ALL CONTRACT ADDRESSES');
  console.log('='.repeat(60));
  console.log('📅 Generated:', new Date().toISOString());
  console.log('📁 Repository: Omega-prime-deployer');
  console.log('🌐 Network: Solana Mainnet');
  console.log('');

  // Read and parse the JSON file
  try {
    const addressData = JSON.parse(fs.readFileSync(path.join(__dirname, 'contract_addresses.json'), 'utf8'));
    const addresses = addressData.omega_prime_addresses;
    
    console.log('🤖 BOT ARMY ADDRESSES (5 Generational AI Bots)');
    console.log('-'.repeat(50));
    Object.entries(addresses.bot_army).forEach(([botKey, bot]) => {
      console.log(`\n${botKey.toUpperCase().replace(/_/g, ' ')} (Gen ${bot.generation})`);
      console.log(`  🏠 Bot Address:      ${bot.bot_address}`);
      console.log(`  📝 Contract Address: ${bot.contract_address}`);
      console.log(`  🎯 Specialty:        ${bot.specialty.replace(/_/g, ' ')}`);
      console.log(`  🧠 Intelligence:     ${bot.intelligence_level}x`);
      if (bot.note) console.log(`  ⚠️  Note:            ${bot.note}`);
    });

    console.log('\n\n👑 CONTROL ADDRESSES');
    console.log('-'.repeat(30));
    console.log(`  🎮 Creator/Master:   ${addresses.control_addresses.creator_master_controller.address}`);
    console.log(`  🔧 Authority:        Full bot army control`);

    console.log('\n\n💰 TREASURY & OPERATIONAL');
    console.log('-'.repeat(35));
    console.log(`  🏛️  Treasury:         ${addresses.treasury_operational.treasury_address}`);
    console.log(`  🎯 Target Wallet:     ${addresses.treasury_operational.target_wallet}`);
    console.log(`  🔄 Relayer:          ${addresses.treasury_operational.relayer_address}`);
    console.log(`  🔄 Secondary:        ${addresses.treasury_operational.secondary_wallet}`);

    console.log('\n\n🔧 SOLANA PROGRAM IDS');
    console.log('-'.repeat(30));
    console.log('  Core Programs:');
    Object.entries(addresses.program_ids.solana_core).forEach(([key, address]) => {
      console.log(`    📌 ${key.replace(/_/g, ' ')}:`.padEnd(25) + address);
    });
    console.log('  DEX & Trading:');
    Object.entries(addresses.program_ids.dex_trading).forEach(([key, address]) => {
      console.log(`    📌 ${key.replace(/_/g, ' ')}:`.padEnd(25) + address);
    });

    console.log('\n\n🪙 TOKEN ADDRESSES');
    console.log('-'.repeat(25));
    console.log(`  💵 USDC Mint:        ${addresses.token_addresses.usdc_mint}`);

    console.log('\n\n🔍 ANALYSIS ADDRESSES');
    console.log('-'.repeat(30));
    console.log(`  📊 Analysis Target:  ${addresses.analysis_addresses.contract_analysis_target}`);

    console.log('\n\n📋 QUICK REFERENCE - ALL ADDRESSES');
    console.log('-'.repeat(45));
    addresses.all_addresses_list.forEach((address, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${address}`);
    });

    console.log('\n\n⚠️ SECURITY REMINDERS');
    console.log('-'.repeat(30));
    console.log('  🔒 All addresses are on Solana Mainnet');
    console.log('  🔑 Private keys must be secured offline');
    console.log('  🛡️  Hardware wallet recommended for high-value addresses');
    console.log('  📝 Test with small amounts first');
    console.log('  🔍 Verify addresses before use in production');

    console.log('\n\n📊 SUMMARY');
    console.log('-'.repeat(15));
    console.log(`  Total Addresses:     ${addresses.all_addresses_list.length}`);
    console.log(`  Bot Addresses:       5`);
    console.log(`  Contract Addresses:  5`);
    console.log(`  Program IDs:         7`);
    console.log(`  Operational:         4`);
    console.log(`  Combined AI Power:   100x human intelligence`);

    console.log('\n✅ CONTRACT ADDRESS DISPLAY COMPLETE');
    console.log('📖 For detailed information, see: ALL_CONTRACT_ADDRESSES.md');
    console.log('📄 For JSON format, see: contract_addresses.json');

  } catch (error) {
    console.error('❌ Error reading contract addresses:', error.message);
    console.log('\n📁 Available files:');
    console.log('  - ALL_CONTRACT_ADDRESSES.md (detailed information)');
    console.log('  - contract_addresses.json (structured data)');
  }
}

// Export for module use
module.exports = { displayAllContractAddresses };

// Run if called directly
if (require.main === module) {
  displayAllContractAddresses();
}