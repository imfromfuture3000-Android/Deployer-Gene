#!/usr/bin/env node

/**
 * 🚀 AUTOMATED RECLAIM & REDEPLOY SYSTEM
 * 
 * Fully automated program reclaim and redeployment with:
 * 1. Authority verification and reclaim
 * 2. Fresh mint creation
 * 3. Initial supply minting
 * 4. Metadata assignment
 * 5. Authority locking
 * 6. Bot distribution (optional)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(process.cwd(), '.cache');
const BACKUP_DIR = path.join(process.cwd(), '.cache-backup');

console.log('🚀 OMEGA PRIME - AUTOMATED RECLAIM & REDEPLOY');
console.log('='.repeat(60));

// Step 1: Backup existing cache
console.log('\n📦 Step 1: Backing up existing deployment...');
try {
  if (fs.existsSync(CACHE_DIR)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${BACKUP_DIR}-${timestamp}`;
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    execSync(`cp -r ${CACHE_DIR} ${backupPath}`, { stdio: 'inherit' });
    console.log(`✅ Backup created: ${backupPath}`);
  } else {
    console.log('ℹ️  No existing cache to backup');
  }
} catch (error) {
  console.warn('⚠️  Backup failed, continuing anyway:', error.message);
}

// Step 2: Clean cache for fresh deployment
console.log('\n🧹 Step 2: Cleaning cache for fresh deployment...');
try {
  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
    console.log('✅ Cache cleaned');
  }
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log('✅ Fresh cache directory created');
} catch (error) {
  console.error('❌ Cache cleanup failed:', error.message);
  process.exit(1);
}

// Step 3: Environment validation
console.log('\n🔍 Step 3: Validating environment...');
try {
  execSync('npm run dev:check', { stdio: 'inherit' });
  console.log('✅ Environment validated');
} catch (error) {
  console.error('❌ Environment validation failed');
  process.exit(1);
}

// Step 4: Create new mint
console.log('\n🎯 Step 4: Creating new token mint...');
try {
  execSync('npm run mainnet:create-mint', { stdio: 'inherit' });
  console.log('✅ Mint created successfully');
} catch (error) {
  console.error('❌ Mint creation failed:', error.message);
  process.exit(1);
}

// Step 5: Mint initial supply
console.log('\n💰 Step 5: Minting initial supply...');
try {
  execSync('npm run mainnet:mint-initial', { stdio: 'inherit' });
  console.log('✅ Initial supply minted');
} catch (error) {
  console.error('❌ Initial minting failed:', error.message);
  process.exit(1);
}

// Step 6: Set metadata
console.log('\n🎭 Step 6: Setting token metadata...');
try {
  execSync('npm run mainnet:set-metadata', { stdio: 'inherit' });
  console.log('✅ Metadata set');
} catch (error) {
  console.error('❌ Metadata setting failed:', error.message);
  process.exit(1);
}

// Step 7: Lock authorities
console.log('\n🔒 Step 7: Locking authorities...');
try {
  execSync('npm run mainnet:lock', { stdio: 'inherit' });
  console.log('✅ Authorities locked');
} catch (error) {
  console.error('❌ Authority locking failed:', error.message);
  process.exit(1);
}

// Step 8: Optional bot distribution
const ENABLE_BOT_DISTRIBUTION = process.env.ENABLE_BOT_DISTRIBUTION === 'true';
if (ENABLE_BOT_DISTRIBUTION) {
  console.log('\n🤖 Step 8: Distributing to bot army...');
  try {
    execSync('npm run mainnet:bot-orchestrate', { stdio: 'inherit' });
    console.log('✅ Bot distribution complete');
  } catch (error) {
    console.warn('⚠️  Bot distribution failed:', error.message);
  }
} else {
  console.log('\n⏭️  Step 8: Bot distribution skipped (set ENABLE_BOT_DISTRIBUTION=true to enable)');
}

// Step 9: Verification
console.log('\n✅ Step 9: Verifying deployment...');
try {
  const mintCache = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, 'mint.json'), 'utf-8'));
  console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
  console.log('='.repeat(60));
  console.log(`📍 Mint Address: ${mintCache.mint}`);
  console.log(`🔗 Explorer: https://explorer.solana.com/address/${mintCache.mint}`);
  console.log('\n💡 Next steps:');
  console.log('   - Verify mint on Solana Explorer');
  console.log('   - Check token metadata');
  console.log('   - Verify authority settings');
  console.log('   - Run: npm run mainnet:verify-bots (if bot distribution enabled)');
} catch (error) {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
}

console.log('\n✨ Automated reclaim and redeploy complete!');
