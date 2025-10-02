#!/usr/bin/env node

/**
 * 🧠 SMART DEPLOYMENT - Auto-fallback on rate limits
 * Tries public RPC first, switches to premium on 429 errors
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const backupEnvPath = path.join(process.cwd(), '.env.backup');

// Premium RPC endpoints (fallback)
const PREMIUM_RPCS = [
  'https://solana-mainnet.g.alchemy.com/v2/demo',
  'https://api.devnet.solana.com', // More permissive
  'https://rpc.ankr.com/solana'
];

let currentRpcIndex = -1; // -1 = public, 0+ = premium

function updateRpc(rpcUrl) {
  let envContent = fs.readFileSync(envPath, 'utf-8');
  envContent = envContent.replace(/^RPC_URL=.*$/m, `RPC_URL=${rpcUrl}`);
  fs.writeFileSync(envPath, envContent);
  console.log(`🔄 Switched to: ${rpcUrl}`);
}

function deploy() {
  try {
    console.log(`\n🚀 Attempt ${currentRpcIndex + 2}: Deploying...`);
    execSync('npm run reclaim:auto', { stdio: 'inherit' });
    console.log('\n✅ Deployment successful!');
    return true;
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    
    if (output.includes('429') || output.includes('Too Many Requests')) {
      console.log('\n⚠️  Rate limit hit!');
      return false;
    }
    
    if (output.includes('unknown signer')) {
      console.log('\n⚠️  Signer issue detected, retrying...');
      return false;
    }
    
    throw error;
  }
}

async function smartDeploy() {
  console.log('🧠 SMART DEPLOYMENT WITH AUTO-FALLBACK');
  console.log('='.repeat(60));
  
  // Backup original .env
  fs.copyFileSync(envPath, backupEnvPath);
  
  // Try public RPC first
  console.log('\n📡 Step 1: Trying public Solana RPC...');
  updateRpc('https://api.mainnet-beta.solana.com');
  
  if (deploy()) {
    fs.unlinkSync(backupEnvPath);
    return;
  }
  
  // Try premium RPCs
  console.log('\n🔄 Switching to premium RPC endpoints...');
  
  for (let i = 0; i < PREMIUM_RPCS.length; i++) {
    currentRpcIndex = i;
    console.log(`\n📡 Step ${i + 2}: Trying ${PREMIUM_RPCS[i]}...`);
    updateRpc(PREMIUM_RPCS[i]);
    
    if (deploy()) {
      fs.unlinkSync(backupEnvPath);
      return;
    }
    
    console.log('⏭️  Trying next endpoint...');
  }
  
  // Restore original .env
  fs.copyFileSync(backupEnvPath, envPath);
  fs.unlinkSync(backupEnvPath);
  
  console.log('\n❌ All RPC endpoints failed. Please configure premium access:');
  console.log('   npm run agent:setup');
  process.exit(1);
}

smartDeploy().catch(error => {
  console.error('\n❌ Smart deployment failed:', error.message);
  if (fs.existsSync(backupEnvPath)) {
    fs.copyFileSync(backupEnvPath, envPath);
    fs.unlinkSync(backupEnvPath);
  }
  process.exit(1);
});
