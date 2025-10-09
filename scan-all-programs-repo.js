#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const REPO_ROOT = '/workspaces/Deployer-Gene';

const PROGRAM_PATTERNS = [
  /[1-9A-HJ-NP-Za-km-z]{32,44}/g, // Solana addresses
  /0x[a-fA-F0-9]{40}/g, // Ethereum addresses
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const programs = new Set();
    
    PROGRAM_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(addr => programs.add(addr));
      }
    });
    
    return Array.from(programs);
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir, results = {}) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath, results);
      }
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.md') || file.endsWith('.json')) {
      const programs = scanFile(filePath);
      if (programs.length > 0) {
        results[filePath] = programs;
      }
    }
  });
  
  return results;
}

console.log('🔍 SCANNING ALL PROGRAMS IN REPO');
console.log('='.repeat(60));

const results = scanDirectory(REPO_ROOT);
const allPrograms = new Set();

Object.entries(results).forEach(([file, programs]) => {
  programs.forEach(p => allPrograms.add(p));
});

console.log(`\n📊 Found ${allPrograms.size} unique programs\n`);

const categorized = {
  solana: [],
  ethereum: [],
  other: []
};

allPrograms.forEach(addr => {
  if (addr.startsWith('0x')) {
    categorized.ethereum.push(addr);
  } else if (addr.length >= 32) {
    categorized.solana.push(addr);
  } else {
    categorized.other.push(addr);
  }
});

console.log(`🔷 Solana Programs: ${categorized.solana.length}`);
console.log(`🔶 Ethereum Contracts: ${categorized.ethereum.length}`);
console.log(`⚪ Other: ${categorized.other.length}`);

fs.writeFileSync('.cache/all-programs-scan.json', JSON.stringify({
  timestamp: new Date().toISOString(),
  total: allPrograms.size,
  categorized,
  fileResults: results
}, null, 2));

console.log('\n✅ Scan complete: .cache/all-programs-scan.json');
