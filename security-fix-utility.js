#!/usr/bin/env node

/**
 * Security Fix Utility
 * Automatically updates JavaScript files to use environment variables instead of hardcoded secrets
 */

const fs = require('fs');
const path = require('path');

// Configuration
const HARDCODED_API_KEY = '16b9324a-5b8c-47b9-9b02-6efa868958e5';
const SOURCE_WALLET = process.env.SOURCE_WALLET_ADDRESS;
const TARGET_WALLET = process.env.TARGET_WALLET_ADDRESS;

// Get all JS files that contain hardcoded secrets
function findFilesWithSecrets() {
  const files = [];
  const walkDir = (dir) => {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', '.cache'].includes(entry)) {
        walkDir(fullPath);
      } else if (stat.isFile() && entry.endsWith('.js')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(HARDCODED_API_KEY)) {
            files.push(fullPath);
          }
        } catch (e) {
          // Skip binary files or files that can't be read
        }
      }
    }
  };
  
  walkDir('.');
  return files;
}

// Fix a single file
function fixFile(filePath) {
  console.log(`🔧 Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Add require('dotenv').config() if not present
  if (!content.includes("require('dotenv')") && !content.includes('require("dotenv")')) {
    if (content.includes("const web3 = require('@solana/web3.js')")) {
      content = content.replace(
        "const web3 = require('@solana/web3.js');",
        "const web3 = require('@solana/web3.js');\nrequire('dotenv').config();"
      );
      modified = true;
    } else if (content.includes('const web3 = require("@solana/web3.js")')) {
      content = content.replace(
        'const web3 = require("@solana/web3.js");',
        'const web3 = require("@solana/web3.js");\nrequire("dotenv").config();'
      );
      modified = true;
    }
  }
  
  // Replace hardcoded API key
  const apiKeyPattern = new RegExp(`https://mainnet\\.helius-rpc\\.com/\\?api-key=${HARDCODED_API_KEY}`, 'g');
  if (content.match(apiKeyPattern)) {
    content = content.replace(
      apiKeyPattern,
      '${process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : (process.env.RPC_URL || "https://api.mainnet-beta.solana.com")}`'
    );
    modified = true;
  }
  
  // Replace hardcoded wallet addresses
  const sourcePattern = new RegExp(`['"]${SOURCE_WALLET}['"]`, 'g');
  if (content.match(sourcePattern)) {
    content = content.replace(sourcePattern, 'process.env.SOURCE_WALLET_ADDRESS');
    modified = true;
  }
  
  const targetPattern = new RegExp(`['"]${TARGET_WALLET}['"]`, 'g');
  if (content.match(targetPattern)) {
    content = content.replace(targetPattern, 'process.env.TARGET_WALLET_ADDRESS');
    modified = true;
  }
  
  // Write back the file if modified
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${filePath}`);
    return true;
  } else {
    console.log(`  ℹ️  No changes needed for ${filePath}`);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔒 Security Fix Utility');
  console.log('======================');
  
  const files = findFilesWithSecrets();
  console.log(`Found ${files.length} files with hardcoded secrets:`);
  
  if (files.length === 0) {
    console.log('✅ No files with hardcoded secrets found!');
    return;
  }
  
  let fixedCount = 0;
  for (const file of files) {
    if (fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log('\\n📊 Summary:');
  console.log(`  Files checked: ${files.length}`);
  console.log(`  Files fixed: ${fixedCount}`);
  console.log(`  Files skipped: ${files.length - fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\\n⚠️  Important:');
    console.log('  1. Set up your .env file with real values');
    console.log('  2. Test the applications to ensure they work');
    console.log('  3. Review the changes before committing');
  }
  
  console.log('\\n🎉 Security fix completed!');
}

if (require.main === module) {
  main();
}

module.exports = { findFilesWithSecrets, fixFile };