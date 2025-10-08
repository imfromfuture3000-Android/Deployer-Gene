#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function scanRepo() {
  console.log('🔍 SCANNING FUTURISTIC-KAMI REPO FOR NODES & VOTES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const repoPath = path.join(__dirname, 'The-Futuristic-Kami-Omni-Engine');
  const results = { nodes: [], votes: [], validators: [], contracts: [] };

  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      // Check for vote-related content
      if (content.match(/vote|Vote111|VoteProgram|validator|consensus/i)) {
        const matches = {
          file: filePath.replace(__dirname + '/', ''),
          type: [],
          lines: []
        };

        if (content.match(/Vote111/)) matches.type.push('vote_program');
        if (content.match(/validator/i)) matches.type.push('validator');
        if (content.match(/consensus/i)) matches.type.push('consensus');
        if (content.match(/node/i)) matches.type.push('node');

        // Get relevant lines
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (line.match(/vote|validator|consensus|node/i)) {
            matches.lines.push({ line: i + 1, content: line.trim().slice(0, 100) });
          }
        });

        if (matches.type.length > 0 && matches.lines.length > 0) {
          results.votes.push(matches);
        }
      }

      // Check for Solana addresses
      const addressMatches = content.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);
      if (addressMatches) {
        addressMatches.forEach(addr => {
          if (addr.length >= 32 && addr.length <= 44) {
            results.contracts.push({ file: fileName, address: addr });
          }
        });
      }

    } catch (e) {}
  }

  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!file.includes('node_modules') && !file.includes('.git')) {
            walkDir(filePath);
          }
        } else if (file.match(/\.(js|ts|json|md)$/)) {
          scanFile(filePath);
        }
      });
    } catch (e) {}
  }

  walkDir(repoPath);

  console.log('📊 SCAN RESULTS:\n');
  console.log(`Files with vote/validator content: ${results.votes.length}`);
  console.log(`Addresses found: ${results.contracts.length}\n`);

  if (results.votes.length > 0) {
    console.log('📋 FILES WITH VOTE/VALIDATOR CONTENT:\n');
    results.votes.slice(0, 10).forEach(v => {
      console.log(`📄 ${v.file}`);
      console.log(`   Types: ${v.type.join(', ')}`);
      console.log(`   Matches: ${v.lines.length} lines\n`);
    });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Vote/Validator Files: ${results.votes.length}`);
  console.log(`Addresses Found: ${results.contracts.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/futuristic-repo-scan.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to .cache/futuristic-repo-scan.json');
}

scanRepo();
