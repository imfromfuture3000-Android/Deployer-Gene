#!/usr/bin/env node

/**
 * MPC Solana Kit - Simplified Demo
 * Shows core MPC functionality without expensive operations
 */

const { MPCWallet, MPCConfig } = require('./mpcCore');
const { 
  ShareStorage, 
  AuditLogger,
  SecurityValidator,
  ConfigManager 
} = require('./mpcUtils');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║        🔐 MPC SOLANA KIT - Multi-Party Computation 🔐        ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

/**
 * Demo 1: Create MPC Wallet
 */
async function demo1() {
  console.log('📋 DEMO 1: Create MPC Wallet');
  console.log('─'.repeat(60));

  const config = new MPCConfig(3, 5);
  const wallet = new MPCWallet(config);
  
  const result = wallet.createWallet('Primary Signer');

  console.log('✅ Wallet created!');
  console.log(`  • MPC ID: ${result.wallet.mpcId}`);
  console.log(`  • Public Key: ${result.wallet.publicKey}`);
  console.log(`  • Total Shares: ${result.wallet.total}`);
  console.log(`  • Threshold: ${result.wallet.threshold}`);
  console.log(`  • Curve: ${result.wallet.curve}`);

  console.log('\n📦 Share Distribution Instructions:');
  const instructions = [
    'Distribute each share to a different participant',
    `Combine any ${result.wallet.threshold} shares to recover the key`,
    'Never store all shares in one location',
    'Keep the share hash for verification'
  ];
  instructions.forEach(instr => console.log(`  • ${instr}`));

  return { wallet, result, config };
}

/**
 * Demo 2: Share Validation
 */
async function demo2(result) {
  console.log('\n\n📋 DEMO 2: Validate Share Integrity');
  console.log('─'.repeat(60));

  const share = result.shares[0];
  const validation = SecurityValidator.validateShare(share);

  console.log(`✅ Share Validation Result:`);
  console.log(`  • Valid: ${validation.valid ? '✅ YES' : '❌ NO'}`);
  console.log(`  • Share Index: ${share.index}`);
  console.log(`  • Threshold: ${share.threshold}`);
  console.log(`  • Total Shares: ${share.total}`);
  
  return validation;
}

/**
 * Demo 3: Recovery Validation
 */
async function demo3(result) {
  console.log('\n\n📋 DEMO 3: Validate Recovery Attempt');
  console.log('─'.repeat(60));

  const sharesToTest = result.shares.slice(0, 3);
  const threshold = result.shares[0].threshold;

  console.log(`Testing recovery with ${sharesToTest.length} shares (threshold: ${threshold})`);

  const validation = SecurityValidator.validateRecoveryAttempt(
    sharesToTest,
    threshold
  );

  console.log(`✅ Recovery Validation Result:`);
  console.log(`  • Share Count: ${validation.shareCount}`);
  console.log(`  • Threshold: ${validation.threshold}`);
  console.log(`  • Sufficient: ${validation.sufficient ? '✅ YES' : '❌ NO'}`);
  
  return validation;
}

/**
 * Demo 4: Audit Logging
 */
async function demo4() {
  console.log('\n\n📋 DEMO 4: Audit Logging');
  console.log('─'.repeat(60));

  const audit = new AuditLogger();

  // Log sample operations
  audit.log({
    type: 'key_operation',
    mpcId: 'test-mpc-001',
    action: 'generate',
    status: 'success',
    details: 'Generated new MPC keypair',
    user: 'alice@example.com'
  });

  audit.log({
    type: 'key_operation',
    mpcId: 'test-mpc-001',
    action: 'sign',
    status: 'success',
    details: 'Signed transaction with 3-of-5 shares',
    user: 'bob@example.com'
  });

  audit.log({
    type: 'share_operation',
    mpcId: 'test-mpc-001',
    action: 'recover',
    status: 'success',
    details: 'Successfully recovered key from shares',
    user: 'charlie@example.com'
  });

  const logs = audit.getLogs();
  const summary = audit.getSummary();

  console.log('✅ Audit logs recorded:');
  console.log(`  • Total Events: ${summary.totalEvents}`);
  console.log(`  • Key Generations: ${summary.keyGenerations}`);
  console.log(`  • Key Recoveries: ${summary.keyRecoveries}`);
  console.log(`  • Signatures: ${summary.signatures}`);
  console.log(`  • Failures: ${summary.failures}`);

  console.log('\n📝 Recent Events:');
  logs.slice(-3).forEach((log, i) => {
    console.log(`  ${i + 1}. [${log.type}] ${log.action} - ${log.status}`);
    console.log(`     User: ${log.user}, MPC: ${log.mpcId}`);
  });

  return { audit, logs, summary };
}

/**
 * Demo 5: Configuration
 */
async function demo5() {
  console.log('\n\n📋 DEMO 5: Configuration Management');
  console.log('─'.repeat(60));

  const defaultConfig = ConfigManager.getDefaultConfig();

  console.log('Default MPC Configuration:');
  console.log(`  • Scheme: ${defaultConfig.scheme}`);
  console.log(`  • Curve: ${defaultConfig.curve}`);
  console.log(`  • Default Threshold: ${defaultConfig.defaultThreshold}`);
  console.log(`  • Default Shares: ${defaultConfig.defaultShares}`);
  console.log(`  • Key Expiry: ${defaultConfig.keyExpiryMinutes} minutes`);
  console.log(`  • Encryption: ${defaultConfig.encryptionAlgorithm}`);
  console.log(`  • Storage Type: ${defaultConfig.storage.type}`);
  console.log(`  • Audit Enabled: ${defaultConfig.audit.enabled}`);

  return defaultConfig;
}

/**
 * Demo 6: Share Storage
 */
async function demo6(result) {
  console.log('\n\n📋 DEMO 6: Encrypted Share Storage');
  console.log('─'.repeat(60));

  const storage = new ShareStorage();
  
  console.log(`Encrypting and storing ${result.shares.length} shares...`);
  
  // Encrypt a share
  const share = result.shares[0];
  const encryptedShare = storage.encryptShare(share);
  
  console.log('✅ Share encrypted with AES-256-GCM');
  console.log(`  • Original size: ${JSON.stringify(share).length} bytes`);
  console.log(`  • Encrypted size: ${Object.keys(encryptedShare).length} keys`);
  console.log(`  • Has IV: ${!!encryptedShare.iv}`);
  console.log(`  • Has Auth Tag: ${!!encryptedShare.authTag}`);
  console.log(`  • Has Encrypted Data: ${!!encryptedShare.encrypted}`);

  // Try to decrypt
  try {
    const decrypted = storage.decryptShare(encryptedShare);
    console.log('✅ Share decrypted successfully');
    console.log(`  • Recovered share index: ${decrypted.index}`);
    console.log(`  • Recovered threshold: ${decrypted.threshold}`);
  } catch (e) {
    console.error('❌ Decryption failed:', e.message);
  }

  return { storage, encryptedShare };
}

/**
 * Run all demos
 */
async function runAllDemos() {
  try {
    console.log('🚀 Starting MPC Solana Kit Demos...\n');

    const demo1Result = await demo1();
    const demo2Result = await demo2(demo1Result.result);
    const demo3Result = await demo3(demo1Result.result);
    const demo4Result = await demo4();
    const demo5Result = await demo5();
    const demo6Result = await demo6(demo1Result.result);

    console.log('\n\n' + '═'.repeat(60));
    console.log('✅ ALL DEMOS COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(60));

    console.log('\n📚 Key Takeaways:');
    console.log('  1. MPC enables secure distributed key management');
    console.log('  2. Keys are split into N shares, M needed to recover');
    console.log('  3. No single party has the complete key');
    console.log('  4. Perfect for multisig wallets and DAOs');
    console.log('  5. Audit trails track all operations');

    console.log('\n🔗 Next Steps:');
    console.log('  1. Integrate with Solana transaction signing');
    console.log('  2. Deploy shares to different infrastructure');
    console.log('  3. Set up backup recovery procedures');
    console.log('  4. Configure automated rotation policies');
    console.log('  5. Monitor audit logs for anomalies');

    console.log('\n📖 For More Info:');
    console.log('  • Read MPC_GUIDE.md for comprehensive documentation');
    console.log('  • Check src/mpc/ directory for implementation files');
    console.log('  • Review test results in your audit logs');

    console.log('\n');

  } catch (error) {
    console.error('❌ Demo Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run demos if executed directly
if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  demo1,
  demo2,
  demo3,
  demo4,
  demo5,
  demo6,
  runAllDemos
};
