#!/usr/bin/env node

const https = require('https');

function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkHeliusUsage() {
  console.log('🚨 HELIUS API KEY SECURITY CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check for exposed API keys in files
  console.log('🔍 CHECKING FOR EXPOSED API KEYS...');
  
  const fs = require('fs');
  const path = require('path');
  
  const suspiciousFiles = [
    '.env',
    '.env.helius', 
    'helius-config.json',
    'quicknode-scanner.js',
    'src/utils/helius-connection.js'
  ];
  
  let exposedKeys = [];
  
  for (const file of suspiciousFiles) {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for actual API keys (not placeholders)
        const keyPatterns = [
          /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
          /[A-Za-z0-9]{32,}/g
        ];
        
        keyPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              if (!match.includes('YOUR_') && !match.includes('your_') && 
                  !match.includes('EXAMPLE') && match.length > 20) {
                exposedKeys.push({ file, key: match.substring(0, 10) + '...' });
              }
            });
          }
        });
      }
    } catch (e) {
      // Skip files we can't read
    }
  }
  
  if (exposedKeys.length > 0) {
    console.log('⚠️ POTENTIAL EXPOSED KEYS FOUND:');
    exposedKeys.forEach(item => {
      console.log(`   ${item.file}: ${item.key}`);
    });
  } else {
    console.log('✅ No exposed API keys found in config files');
  }
  
  // Check environment variables
  console.log('\n🔍 CHECKING ENVIRONMENT VARIABLES...');
  const heliusKey = process.env.HELIUS_API_KEY;
  
  if (!heliusKey || heliusKey === 'your_helius_api_key_here' || heliusKey === 'YOUR_HELIUS_API_KEY') {
    console.log('✅ No real Helius API key in environment');
  } else {
    console.log('⚠️ Helius API key detected in environment');
    console.log(`   Key: ${heliusKey.substring(0, 8)}...`);
    
    // Try to check usage if we have a key
    try {
      console.log('\n📊 CHECKING API USAGE...');
      
      // Helius doesn't have a public usage endpoint, so we'll test with a simple call
      const testUrl = `https://api.helius.xyz/v0/addresses/zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4?api-key=${heliusKey}`;
      
      const result = await makeRequest(testUrl);
      
      if (result.status === 200) {
        console.log('✅ API key is valid and working');
      } else if (result.status === 401) {
        console.log('❌ API key is invalid or expired');
      } else if (result.status === 429) {
        console.log('🚨 RATE LIMITED - Possible unauthorized usage!');
      } else {
        console.log(`⚠️ Unexpected response: ${result.status}`);
      }
      
    } catch (error) {
      console.log('❌ Unable to test API key:', error.message);
    }
  }
  
  // Check for hardcoded endpoints in cloned repo
  console.log('\n🔍 CHECKING CLONED REPOSITORY...');
  const repoPath = './The-Futuristic-Kami-Omni-Engine';
  
  if (fs.existsSync(repoPath)) {
    try {
      const configFiles = [
        'azure-mcp-config.json',
        'mcp-server-config.json',
        '.env',
        '.env.example'
      ];
      
      for (const file of configFiles) {
        const filePath = path.join(repoPath, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('helius') || content.includes('api-key')) {
            console.log(`⚠️ Helius references found in: ${file}`);
          }
        }
      }
    } catch (e) {
      console.log('❌ Unable to scan cloned repository');
    }
  }
  
  console.log('\n🛡️ SECURITY RECOMMENDATIONS:');
  console.log('1. Rotate your Helius API key immediately');
  console.log('2. Check Helius dashboard for unusual activity');
  console.log('3. Remove any hardcoded keys from files');
  console.log('4. Use environment variables only');
  console.log('5. Add .env files to .gitignore');
  
  return exposedKeys.length > 0;
}

checkHeliusUsage().then(hasExposedKeys => {
  if (hasExposedKeys) {
    console.log('\n🚨 ACTION REQUIRED: Secure your API keys immediately!');
    process.exit(1);
  } else {
    console.log('\n✅ Security check completed');
  }
});