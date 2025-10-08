const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

const BACKFILL = '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y';

console.log('🔑 Checking All Keypairs\n');

const keypairFiles = [
  '.cache/user_auth.json',
  '.cache/deployer-keypair.json'
];

// Check all cache files
const cacheFiles = fs.readdirSync('.cache').filter(f => f.endsWith('.json'));

cacheFiles.forEach(file => {
  try {
    const content = fs.readFileSync(`.cache/${file}`, 'utf-8');
    const json = JSON.parse(content);
    
    if (Array.isArray(json) && json.length === 64 && json.every(n => typeof n === 'number')) {
      const kp = Keypair.fromSecretKey(new Uint8Array(json));
      const pubkey = kp.publicKey.toBase58();
      
      console.log(`📄 ${file}`);
      console.log(`   Public Key: ${pubkey}`);
      
      if (pubkey === BACKFILL) {
        console.log(`   🎯 MATCH! This is the backfill keypair!`);
        console.log(`\n✅ FOUND BACKFILL PRIVATE KEY: .cache/${file}\n`);
      }
      console.log('');
    }
  } catch (e) {}
});

// Check git history for deleted keypair files
console.log('🗑️  Checking git history for deleted keypairs...\n');
try {
  const { execSync } = require('child_process');
  const commits = execSync('git log --all --pretty=format:"%H" --', { encoding: 'utf-8' }).split('\n').slice(0, 100);
  
  for (const hash of commits) {
    try {
      const files = execSync(`git ls-tree -r ${hash} --name-only`, { encoding: 'utf-8' }).split('\n');
      const keypairFiles = files.filter(f => f.includes('backfill') || f.includes('relayer'));
      
      for (const file of keypairFiles) {
        try {
          const content = execSync(`git show ${hash}:${file}`, { encoding: 'utf-8' });
          const json = JSON.parse(content);
          
          if (Array.isArray(json) && json.length === 64) {
            const kp = Keypair.fromSecretKey(new Uint8Array(json));
            const pubkey = kp.publicKey.toBase58();
            
            if (pubkey === BACKFILL) {
              console.log(`🎯 FOUND in git history!`);
              console.log(`   Commit: ${hash}`);
              console.log(`   File: ${file}`);
              console.log(`   Public Key: ${pubkey}\n`);
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
} catch (e) {}

console.log('❌ Backfill keypair not found in current files or git history');
