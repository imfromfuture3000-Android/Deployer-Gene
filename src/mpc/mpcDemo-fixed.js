#!/usr/bin/env node

/**
 * MPC Solana Kit - Demo & Testing
 * Shows how to use the Multi-Party Computation system
 */

const { MPCWallet, MPCConfig } = require('./mpcCore');
const { 
  ShareStorage, 
  ShareDistributor, 
  AuditLogger,
  SecurityValidator,
  ConfigManager 
} = require('./mpcUtils');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                                                                ║');
console.log('║        🔐 MPC SOLANA KIT - Multi-Party Computation 🔐        ║');
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝');

/**
 * Demo 1: Create MPC Wallet
 */
async function demo1_CreateMPCWallet() {
  console.log('\n📋 DEMO 1: Create MPC Wallet');
  console.log('─'.repeat(60));

  const config = new MPCConfig(
    3,  // threshold - need 3 shares
    5   // total shares
  );

  const wallet = new MPCWallet(config);
  
  console.log('Creating wallet with config:');
  console.log(`  • Threshold: ${config.threshold} of ${config.shares}`);
  console.log(`  • Scheme: ${config.scheme}`);
  console.log(`  • Curve: ${config.curve}`);

  const result = wallet.createWallet('Primary Signer');

  console.log('\n✅ Wallet created!');
  console.log(`  • MPC ID: ${result.wallet.mpcId}`);
  console.log(`  • Public Key: ${result.wallet.publicKey}`);
  console.log(`  • Total Shares: ${result.wallet.total}`);
  console.log(`  • Threshold: ${result.wallet.threshold}`);

  console.log('\n📦 Share Distribution Instructions:');
  const instructions = [
    'Distribute each share to a different participant',
    `Combine any ${result.wallet.threshold} shares to recover the key`,
    'Never store all shares in one location',
    'Keep the share hash for verification'
  ];
  instructions.forEach(instruction => {
    console.log(`  • ${instruction}`);
  });

  console.log('\n📤 Shares Generated (store securely):');
  result.shares.forEach((share, i) => {
    console.log(`  Share ${i + 1}: ${share.value.substring(0, 20)}...`);
  });

  return { wallet, result };
}

/**
 * Demo 2: Distribute Shares Among Participants
 */
async function demo2_DistributeShares(wallet, result) {
  console.log('\n📋 DEMO 2: Distribute Shares to Participants');
  console.log('─'.repeat(60));

  const participants = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' },
    { name: 'Diana', email: 'diana@example.com' },
    { name: 'Eve', email: 'eve@example.com' }
  ];

  console.log(`Distributing ${result.shares.length} shares to ${participants.length} participants...`);

  const distribution = ShareDistributor.createDistributionPackages(
    result.shares,
    participants
  );

  console.log('\n✅ Distribution packages created!');
  console.log(`Threshold: ${distribution.metadata.threshold} of ${distribution.metadata.totalParticipants}`);

  distribution.packages.forEach((pkg, i) => {
    console.log(`\n  📧 Participant ${i + 1}: ${pkg.name}`);
    console.log(`     Email: ${pkg.email}`);
    console.log(`     Share Index: ${pkg.index}`);
    console.log(`     Participant ID: ${pkg.participantId.substring(0, 16)}...`);
  });

  return { distribution, participants };
}

/**
 * Demo 3: Sign Message with MPC
 */
async function demo3_SignWithMPC(wallet, result) {
  console.log('\n📋 DEMO 3: Sign Message with MPC');
  console.log('─'.repeat(60));

  const message = 'Transfer 1 SOL to recipient';
  console.log(`Message: "${message}"`);

  // For demo, we'll use the first 3 shares (meeting threshold)
  const sharesToUse = result.shares.slice(0, 3);
  
  console.log(`\nUsing ${sharesToUse.length} shares to sign (threshold: 3)`);

  const mpcId = wallet.listWallets()[0].mpcId;
  
  const signResult = wallet.sign(mpcId, message, sharesToUse);

  console.log('\n✅ Message signed!');
  console.log(`  • Signature: ${signResult.signature.substring(0, 40)}...`);
  console.log(`  • Verified: ${signResult.verified ? '✅ YES' : '❌ NO'}`);
  console.log(`  • Public Key: ${signResult.publicKey}`);
  console.log(`  • Timestamp: ${signResult.timestamp}`);

  return signResult;
}

/**
 * Demo 4: Validate Share Integrity
 */
async function demo4_ValidateShares(result) {
  console.log('\n📋 DEMO 4: Validate Share Integrity');
  console.log('─'.repeat(60));

  const share = result.shares[0];
  
  console.log('Validating share...');
  const validation = SecurityValidator.validateShare(share);

  console.log(`\n✅ Share Validation Result:`);
  console.log(`  • Valid: ${validation.valid ? '✅ YES' : '❌ NO'}`);
  console.log(`  • Share Index: ${share.index}`);
  console.log(`  • Threshold: ${share.threshold}`);
  console.log(`  • Total Shares: ${share.total}`);
  
  if (validation.errors.length > 0) {
    console.log('  • Errors:');
    validation.errors.forEach(err => console.log(`    - ${err}`));
  }

  return validation;
}

/**
 * Demo 5: Recovery Validation
 */
async function demo5_ValidateRecovery(result) {
  console.log('\n📋 DEMO 5: Validate Recovery Attempt');
  console.log('─'.repeat(60));

  const sharesToTest = result.shares.slice(0, 3);
  const threshold = result.shares[0].threshold;

  console.log(`Testing recovery with ${sharesToTest.length} shares (threshold: ${threshold})`);

  const validation = SecurityValidator.validateRecoveryAttempt(
    sharesToTest,
    threshold
  );

  console.log('\n✅ Recovery Validation Result:');
  console.log(`  • Share Count: ${validation.shareCount}`);
  console.log(`  • Threshold: ${validation.threshold}`);
  console.log(`  • Sufficient: ${validation.sufficient ? '✅ YES' : '❌ NO'}`);
  
  if (validation.errors.length > 0) {
    console.log('  • Errors:');
    validation.errors.forEach(err => console.log(`    - ${err}`));
  } else {
    console.log('  • No errors - ready to recover!');
  }

  return validation;
}

/**
 * Demo 6: Audit Logging
 */
async function demo6_AuditLogging() {
  console.log('\n📋 DEMO 6: Audit Logging');
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

  console.log('\nRecent Events:');
  logs.slice(-3).forEach((log, i) => {
    console.log(`  ${i + 1}. [${log.type}] ${log.action} - ${log.status}`);
    console.log(`     User: ${log.user}, MPC: ${log.mpcId.substring(0, 10)}...`);
  });

  return { audit, logs, summary };
}

/**
 * Demo 7: Configuration Management
 */
async function demo7_Configuration() {
  console.log('\n📋 DEMO 7: Configuration Management');
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
 * Run all demos
 */
async function runAllDemos() {
  try {
    console.log('\n🚀 Starting MPC Solana Kit Demos...\n');

    const demo1 = await demo1_CreateMPCWallet();
    const demo2 = await demo2_DistributeShares(demo1.wallet, demo1.result);
    const demo3 = await demo3_SignWithMPC(demo1.wallet, demo1.result);
    const demo4 = await demo4_ValidateShares(demo1.result);
    const demo5 = await demo5_ValidateRecovery(demo1.result);
    const demo6 = await demo6_AuditLogging();
    const demo7 = await demo7_Configuration();

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
  demo1_CreateMPCWallet,
  demo2_DistributeShares,
  demo3_SignWithMPC,
  demo4_ValidateShares,
  demo5_ValidateRecovery,
  demo6_AuditLogging,
  demo7_Configuration,
  runAllDemos
};
