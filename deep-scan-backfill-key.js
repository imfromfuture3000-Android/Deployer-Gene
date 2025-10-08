const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKFILL = '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y';

console.log('🔍 Deep Scan: Hunting Backfill Private Key\n');
console.log(`Target: ${BACKFILL}\n`);

const results = {
  timestamp: new Date().toISOString(),
  target: BACKFILL,
  findings: []
};

// 1. Scan all cache files
console.log('📁 Scanning .cache files...');
const cacheFiles = fs.readdirSync('.cache').filter(f => f.endsWith('.json'));
cacheFiles.forEach(file => {
  const content = fs.readFileSync(`.cache/${file}`, 'utf-8');
  if (content.includes(BACKFILL)) {
    try {
      const json = JSON.parse(content);
      results.findings.push({
        location: `.cache/${file}`,
        type: 'cache_file',
        hasAddress: true,
        hasPrivateKey: content.includes('privateKey') || content.includes('secretKey') || /\[\d+,\d+,/.test(content)
      });
    } catch (e) {}
  }
});

// 2. Git commit history
console.log('📜 Scanning git commit history...');
try {
  const commits = execSync('git log --all --oneline', { encoding: 'utf-8' }).trim().split('\n');
  console.log(`   Found ${commits.length} commits`);
  
  commits.slice(0, 50).forEach(commit => {
    const hash = commit.split(' ')[0];
    try {
      const diff = execSync(`git show ${hash}`, { encoding: 'utf-8' });
      if (diff.includes(BACKFILL)) {
        results.findings.push({
          location: `git commit ${hash}`,
          type: 'git_commit',
          commit: commit,
          hasPrivateKey: diff.includes('privateKey') || /\[\d+,\d+,/.test(diff)
        });
      }
    } catch (e) {}
  });
} catch (e) {
  console.log('   Git scan failed:', e.message);
}

// 3. Search all JSON files
console.log('🔎 Scanning all JSON files...');
try {
  const jsonFiles = execSync('find . -name "*.json" -not -path "./node_modules/*" -not -path "./.git/*"', 
    { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
  
  jsonFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes(BACKFILL)) {
        const hasKey = content.includes('privateKey') || content.includes('secretKey') || /\[\d+,\d+,/.test(content);
        results.findings.push({
          location: file,
          type: 'json_file',
          hasAddress: true,
          hasPrivateKey: hasKey
        });
        
        if (hasKey) {
          console.log(`   ⚠️  Potential key in: ${file}`);
        }
      }
    } catch (e) {}
  });
} catch (e) {}

// 4. Check environment and config files
console.log('⚙️  Scanning config files...');
const configFiles = ['.env', '.env.local', '.env.production', 'config.json', 'secrets.json'];
configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes(BACKFILL)) {
      results.findings.push({
        location: file,
        type: 'config_file',
        hasAddress: true,
        hasPrivateKey: content.includes('PRIVATE') || content.includes('SECRET')
      });
    }
  }
});

// 5. Search for keypair patterns
console.log('🔑 Searching for keypair patterns...');
try {
  const keypairFiles = execSync('find .cache -name "*.json" -exec grep -l "\\[.*,.*,.*\\]" {} \\;', 
    { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
  
  keypairFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const json = JSON.parse(content);
      
      // Check if it's an array of 64 numbers (keypair format)
      if (Array.isArray(json) && json.length === 64 && json.every(n => typeof n === 'number')) {
        const { Keypair } = require('@solana/web3.js');
        const kp = Keypair.fromSecretKey(new Uint8Array(json));
        const pubkey = kp.publicKey.toBase58();
        
        results.findings.push({
          location: file,
          type: 'keypair_file',
          publicKey: pubkey,
          isBackfill: pubkey === BACKFILL
        });
        
        if (pubkey === BACKFILL) {
          console.log(`\n🎯 FOUND BACKFILL KEYPAIR: ${file}`);
          console.log(`   Public Key: ${pubkey}`);
        }
      }
    } catch (e) {}
  });
} catch (e) {}

// 6. Check git stash
console.log('💾 Checking git stash...');
try {
  const stash = execSync('git stash list', { encoding: 'utf-8' });
  if (stash) {
    results.findings.push({
      location: 'git stash',
      type: 'git_stash',
      hasStash: true
    });
  }
} catch (e) {}

// 7. Search deleted files in git
console.log('🗑️  Searching deleted files...');
try {
  const deleted = execSync(`git log --diff-filter=D --summary | grep delete | grep -i "backfill\\|auth\\|keypair"`, 
    { encoding: 'utf-8' }).trim();
  if (deleted) {
    results.findings.push({
      location: 'deleted_files',
      type: 'git_deleted',
      files: deleted.split('\n')
    });
  }
} catch (e) {}

// Save results
fs.writeFileSync('.cache/backfill-key-scan.json', JSON.stringify(results, null, 2));

console.log('\n📊 SCAN RESULTS:\n');
console.log(`Total findings: ${results.findings.length}`);

const withKeys = results.findings.filter(f => f.hasPrivateKey || f.isBackfill);
console.log(`Potential keys: ${withKeys.length}\n`);

if (withKeys.length > 0) {
  console.log('🔑 Files with potential keys:');
  withKeys.forEach(f => {
    console.log(`   ${f.isBackfill ? '🎯' : '⚠️ '} ${f.location}`);
  });
} else {
  console.log('❌ No private key found for backfill address');
  console.log('\n💡 Suggestions:');
  console.log('   1. Check if backfill was created in another repo');
  console.log('   2. Check backup locations or external storage');
  console.log('   3. Check if address was imported from elsewhere');
}

console.log('\n💾 Full results: .cache/backfill-key-scan.json');
