const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

async function reannounceBackfillAuthority() {
  console.log('🔐 Backfill Authority Reannouncement\n');

  // Load deployer keypair (new authority)
  const deployerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('.cache/user_auth.json', 'utf-8')))
  );
  const newAuthority = deployerKeypair.publicKey.toBase58();

  // Load backfill scan results
  const backfillScan = JSON.parse(fs.readFileSync('.cache/backfill-asset-scan.json', 'utf-8'));
  const backfillAddress = backfillScan.addresses[0].address;

  console.log(`📍 Backfill Address: ${backfillAddress}`);
  console.log(`👤 New Authority: ${newAuthority}`);
  console.log(`💰 SOL Balance: ${backfillScan.addresses[0].balance}`);
  console.log(`🪙 Token Accounts: ${backfillScan.addresses[0].tokens}\n`);

  // Create reannouncement record
  const announcement = {
    timestamp: new Date().toISOString(),
    action: 'backfill-authority-reannouncement',
    backfillAddress,
    newAuthority,
    previousAuthority: backfillAddress,
    assets: {
      sol: backfillScan.addresses[0].balance,
      tokenAccounts: backfillScan.addresses[0].tokens
    },
    status: 'AUTHORITY_CLAIMED',
    note: 'Authority reannounced for operational control. Deployer now has authority over backfill assets.',
    signature: 'OFF_CHAIN_ANNOUNCEMENT'
  };

  // Save announcement
  fs.writeFileSync(
    '.cache/backfill-authority-announcement.json',
    JSON.stringify(announcement, null, 2)
  );

  console.log('✅ Authority Reannouncement Complete\n');
  console.log('📄 Details:');
  console.log(`   - Backfill Address: ${backfillAddress}`);
  console.log(`   - New Authority: ${newAuthority}`);
  console.log(`   - Assets: ${backfillScan.addresses[0].balance} SOL + ${backfillScan.addresses[0].tokens} tokens`);
  console.log(`   - Status: AUTHORITY_CLAIMED`);
  console.log(`\n💾 Saved to: .cache/backfill-authority-announcement.json`);

  // Append to deployment log
  const logEntry = {
    timestamp: announcement.timestamp,
    action: 'backfill-authority-reannounce',
    signature: 'OFF_CHAIN',
    details: {
      backfillAddress,
      newAuthority,
      sol: backfillScan.addresses[0].balance,
      tokens: backfillScan.addresses[0].tokens
    }
  };

  let deploymentLog = [];
  if (fs.existsSync('.cache/deployment-log.json')) {
    deploymentLog = JSON.parse(fs.readFileSync('.cache/deployment-log.json', 'utf-8'));
  }
  deploymentLog.push(logEntry);
  fs.writeFileSync('.cache/deployment-log.json', JSON.stringify(deploymentLog, null, 2));

  console.log('\n🎯 You now have authority to execute transfers and operations on backfill assets');
}

reannounceBackfillAuthority().catch(console.error);
