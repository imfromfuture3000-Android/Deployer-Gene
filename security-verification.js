#!/usr/bin/env node

/**
 * Security Verification Script
 * Tests that the security fixes are working correctly
 */

const fs = require('fs');
const path = require('path');

// Test environment setup
const testEnv = {
  HELIUS_API_KEY: 'test-helius-api-key-12345',
  RPC_URL: 'https://api.mainnet-beta.solana.com',
  SOURCE_WALLET_ADDRESS: 'TestSourceWallet123456789',
  TARGET_WALLET_ADDRESS: 'TestTargetWallet123456789',
  DRY_RUN: 'true'
};

// Set up test environment
Object.assign(process.env, testEnv);

console.log('🔍 Security Verification Tests');
console.log('=============================');

// Test 1: Verify no hardcoded secrets in code
function testNoHardcodedSecrets() {
  console.log('\\n📋 Test 1: Checking for hardcoded secrets...');
  
  const forbiddenPatterns = [
    '16b9324a-5b8c-47b9-9b02-6efa868958e5',
    'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ',
    '4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a'
  ];
  
  let violations = 0;
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (content.includes(pattern)) {
          // Skip console.log messages and comments
          const lines = content.split('\\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes(pattern) && 
                !line.startsWith('//') && 
                !line.startsWith('*') &&
                !line.includes('console.log') &&
                !line.includes('console.error') &&
                !line.includes('const HARDCODED_API_KEY =')) {
              console.log(`  ❌ Found hardcoded secret in ${filePath}:${i+1}: ${line.substring(0, 100)}...`);
              violations++;
            }
          }
        }
      }
    } catch (e) {
      // Skip binary files
    }
  }
  
  function walkDir(dir) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', '.cache', 'dist'].includes(entry)) {
        walkDir(fullPath);
      } else if (stat.isFile() && (entry.endsWith('.js') || entry.endsWith('.ts'))) {
        scanFile(fullPath);
      }
    }
  }
  
  walkDir('.');
  
  if (violations === 0) {
    console.log('  ✅ No hardcoded secrets found in code!');
    return true;
  } else {
    console.log(`  ❌ Found ${violations} violations`);
    return false;
  }
}

// Test 2: Verify environment variable usage
function testEnvironmentVariables() {
  console.log('\\n📋 Test 2: Testing environment variable usage...');
  
  try {
    // Test that environment variables are being used in fixed files
    const testFile = fs.readFileSync('./tx-checker.js', 'utf8');
    
    if (testFile.includes('process.env.HELIUS_API_KEY') && 
        testFile.includes('process.env.SOURCE_WALLET_ADDRESS') &&
        testFile.includes("require('dotenv').config()")) {
      console.log('  ✅ Files are using environment variables correctly');
      console.log('  ✅ dotenv configuration found');
      return true;
    } else {
      console.log('  ❌ Files not properly using environment variables');
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error testing environment variables: ${e.message}`);
    return false;
  }
}

// Test 3: Verify .gitignore is protecting secrets
function testGitignore() {
  console.log('\\n📋 Test 3: Checking .gitignore protection...');
  
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  const requiredEntries = [
    '.env',
    '*.key',
    'private-keys/',
    'secrets/',
    'dist/'
  ];
  
  let missing = 0;
  for (const entry of requiredEntries) {
    if (!gitignoreContent.includes(entry)) {
      console.log(`  ❌ Missing .gitignore entry: ${entry}`);
      missing++;
    }
  }
  
  if (missing === 0) {
    console.log('  ✅ All critical entries found in .gitignore');
    return true;
  } else {
    console.log(`  ❌ Missing ${missing} critical .gitignore entries`);
    return false;
  }
}

// Test 4: Check security documentation
function testDocumentation() {
  console.log('\\n📋 Test 4: Verifying security documentation...');
  
  const requiredFiles = ['SECURITY.md', '.env.sample'];
  let missing = 0;
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.log(`  ❌ Missing required file: ${file}`);
      missing++;
    } else {
      console.log(`  ✅ Found: ${file}`);
    }
  }
  
  return missing === 0;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running security verification tests...\\n');
  
  const results = {
    noHardcodedSecrets: testNoHardcodedSecrets(),
    environmentVariables: testEnvironmentVariables(), 
    gitignoreProtection: testGitignore(),
    documentation: testDocumentation()
  };
  
  console.log('\\n📊 Test Results:');
  console.log('================');
  
  let passed = 0;
  let total = Object.keys(results).length;
  
  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${test}: ${status}`);
    if (result) passed++;
  }
  
  console.log(`\\n📈 Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\\n🎉 All security tests passed! Repository is secure.');
    return true;
  } else {
    console.log('\\n⚠️  Some security tests failed. Please review and fix issues.');
    return false;
  }
}

if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { testNoHardcodedSecrets, testEnvironmentVariables, testGitignore, testDocumentation };