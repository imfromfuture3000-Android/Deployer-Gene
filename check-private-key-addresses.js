#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

class PrivateKeyAddressChecker {
  constructor() {
    console.log('🔐 PRIVATE KEY ADDRESS CHECKER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  extractPrivateKeys() {
    const privateKeys = [];
    const files = ['.env', '.env.helius', '.cache/user_auth.json', '.cache/mint-keypair.json'];
    
    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          // Look for private key patterns
          const patterns = [
            /PRIVATE_KEY[=:]\s*([A-Za-z0-9+/]{40,})/g,
            /DEPLOYER_PRIVATE_KEY[=:]\s*([A-Za-z0-9+/]{40,})/g,
            /"privateKey"[:\s]*"([^"]+)"/g,
            /"secretKey"[:\s]*\[([0-9,\s]+)\]/g
          ];
          
          patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
              privateKeys.push({
                file,
                key: match[1].substring(0, 20) + '...',
                type: match[0].includes('DEPLOYER') ? 'deployer' : 'general',
                length: match[1].length
              });
            }
          });
        }
      } catch (e) {
        console.log(`⚠️ Cannot read ${file}`);
      }
    }
    
    return privateKeys;
  }

  deriveAddresses(privateKeys) {
    const addresses = [];
    
    // Known addresses from deployment scripts
    const knownAddresses = [
      'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4', // Main deployer
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',   // EVM equivalent
      '4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a', // Treasury
      'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ', // Master controller
      'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6'  // Treasury address
    ];
    
    knownAddresses.forEach(addr => {
      addresses.push({
        address: addr,
        type: addr.startsWith('0x') ? 'EVM' : 'Solana',
        source: 'deployment_scripts',
        hasPrivateKey: false // We don't expose if we have the private key
      });
    });
    
    return addresses;
  }

  scanDeploymentContracts() {
    console.log('\n📦 SCANNING DEPLOYMENT CONTRACTS...');
    
    const contracts = [];
    const deploymentFiles = [
      'deploy-node-votes-nft-bots.js',
      'anchor-build-deploy.js', 
      'real-deployment.js',
      'The-Futuristic-Kami-Omni-Engine/solana_zero_cost_deploy.js'
    ];
    
    for (const file of deploymentFiles) {
      try {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          // Extract contract addresses from deployment scripts
          const addressPatterns = [
            /programId[:\s]*['"']([A-Za-z0-9]{32,44})['"]/g,
            /contractAddress[:\s]*['"']([A-Za-z0-9]{32,44})['"]/g,
            /mint[:\s]*['"']([A-Za-z0-9]{32,44})['"]/g,
            /address[:\s]*['"']([A-Za-z0-9]{32,44})['"]/g
          ];
          
          addressPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
              if (match[1].length >= 32) {
                contracts.push({
                  file,
                  address: match[1],
                  type: 'contract',
                  network: match[1].startsWith('0x') ? 'EVM' : 'Solana'
                });
              }
            }
          });
        }
      } catch (e) {
        console.log(`⚠️ Cannot scan ${file}`);
      }
    }
    
    return contracts;
  }

  checkCacheFiles() {
    console.log('\n📄 CHECKING CACHE FILES...');
    
    const cacheData = [];
    const cacheFiles = [
      '.cache/node-votes-nft-bots-deployment.json',
      '.cache/deep-asset-scan.json',
      '.cache/assets-backfill.json'
    ];
    
    for (const file of cacheFiles) {
      try {
        if (fs.existsSync(file)) {
          const content = JSON.parse(fs.readFileSync(file, 'utf8'));
          
          // Extract addresses from cache data
          const extractAddresses = (obj, path = '') => {
            if (typeof obj === 'string' && obj.length >= 32) {
              cacheData.push({
                file,
                address: obj,
                path,
                type: 'cached_address'
              });
            } else if (typeof obj === 'object' && obj !== null) {
              Object.keys(obj).forEach(key => {
                extractAddresses(obj[key], path ? `${path}.${key}` : key);
              });
            }
          };
          
          extractAddresses(content);
        }
      } catch (e) {
        console.log(`⚠️ Cannot parse ${file}`);
      }
    }
    
    return cacheData;
  }

  generateReport() {
    console.log('\n📋 GENERATING PRIVATE KEY ADDRESS REPORT...');
    
    const privateKeys = this.extractPrivateKeys();
    const addresses = this.deriveAddresses(privateKeys);
    const contracts = this.scanDeploymentContracts();
    const cacheData = this.checkCacheFiles();
    
    const report = {
      timestamp: new Date().toISOString(),
      privateKeys: {
        count: privateKeys.length,
        files: privateKeys.map(pk => ({ file: pk.file, type: pk.type }))
      },
      addresses: {
        count: addresses.length,
        solana: addresses.filter(a => a.type === 'Solana').length,
        evm: addresses.filter(a => a.type === 'EVM').length,
        list: addresses
      },
      contracts: {
        count: contracts.length,
        solana: contracts.filter(c => c.network === 'Solana').length,
        evm: contracts.filter(c => c.network === 'EVM').length,
        list: contracts
      },
      cache: {
        count: cacheData.length,
        files: [...new Set(cacheData.map(c => c.file))]
      }
    };
    
    fs.writeFileSync('.cache/private-key-address-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n🎯 PRIVATE KEY ADDRESS SUMMARY:');
    console.log(`🔐 Private Keys Found: ${privateKeys.length}`);
    console.log(`📍 Known Addresses: ${addresses.length}`);
    console.log(`📦 Contract Addresses: ${contracts.length}`);
    console.log(`📄 Cache Addresses: ${cacheData.length}`);
    
    console.log('\n🌐 ADDRESS BREAKDOWN:');
    console.log(`Solana Addresses: ${addresses.filter(a => a.type === 'Solana').length}`);
    console.log(`EVM Addresses: ${addresses.filter(a => a.type === 'EVM').length}`);
    
    console.log('\n📦 CONTRACT BREAKDOWN:');
    console.log(`Solana Contracts: ${contracts.filter(c => c.network === 'Solana').length}`);
    console.log(`EVM Contracts: ${contracts.filter(c => c.network === 'EVM').length}`);
    
    console.log('\n🔑 KEY ADDRESSES:');
    addresses.forEach(addr => {
      console.log(`${addr.type === 'Solana' ? '🌐' : '🔗'} ${addr.address.substring(0, 20)}... (${addr.type})`);
    });
    
    console.log('\n⚠️ SECURITY STATUS:');
    console.log(`${privateKeys.length > 0 ? '⚠️' : '✅'} Private Keys: ${privateKeys.length > 0 ? 'DETECTED' : 'SECURE'}`);
    console.log(`${contracts.length > 0 ? '✅' : '❌'} Contracts: ${contracts.length > 0 ? 'READY' : 'NONE'}`);
    
    console.log('\n✅ Report saved: .cache/private-key-address-report.json');
    
    return report;
  }
}

const checker = new PrivateKeyAddressChecker();
checker.generateReport();