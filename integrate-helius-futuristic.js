#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function integrateHeliusToFuturistic() {
  console.log('🔗 INTEGRATING HELIUS RPC TO FUTURISTIC KAMI OMNI ENGINE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const futuristicPath = './The-Futuristic-Kami-Omni-Engine';
  const deployerEnv = './.env';
  
  // Read Deployer-Gene Helius config
  let heliusApiKey = '';
  let heliusRpc = '';
  
  try {
    const deployerEnvContent = fs.readFileSync(deployerEnv, 'utf8');
    const heliusMatch = deployerEnvContent.match(/HELIUS_API_KEY=(.+)/);
    if (heliusMatch) {
      heliusApiKey = heliusMatch[1];
      heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    }
  } catch (e) {
    console.log('⚠️ Could not read Deployer-Gene .env file');
  }

  // Update Futuristic Kami .env
  const futuristicEnvPath = path.join(futuristicPath, '.env');
  
  try {
    let futuristicEnv = fs.readFileSync(futuristicEnvPath, 'utf8');
    
    // Add Helius configuration
    const heliusConfig = `
# Helius RPC Integration from Deployer-Gene
HELIUS_API_KEY=${heliusApiKey || 'your_helius_api_key_here'}
HELIUS_RPC_URL=${heliusRpc || 'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'}
SOLANA_RPC_URL=${heliusRpc || 'https://api.mainnet-beta.solana.com'}

# Enhanced Solana Configuration
SOLANA_NETWORK=mainnet-beta
SOLANA_COMMITMENT=confirmed
ENABLE_HELIUS_WEBHOOKS=true
ENABLE_HELIUS_DAS=true
`;

    // Append Helius config if not already present
    if (!futuristicEnv.includes('HELIUS_API_KEY')) {
      futuristicEnv += heliusConfig;
      fs.writeFileSync(futuristicEnvPath, futuristicEnv);
      console.log('✅ Added Helius configuration to Futuristic Kami .env');
    } else {
      console.log('✅ Helius configuration already exists in Futuristic Kami');
    }

  } catch (e) {
    console.log('❌ Could not update Futuristic Kami .env:', e.message);
  }

  // Update Solana deployment script
  const solanaDeployPath = path.join(futuristicPath, 'solana_zero_cost_deploy.js');
  
  try {
    let deployScript = fs.readFileSync(solanaDeployPath, 'utf8');
    
    // Replace RPC URL with Helius
    const updatedScript = deployScript.replace(
      /this\.connection = new Connection\(process\.env\.SOLANA_RPC_URL \|\| '[^']+'\)/,
      `this.connection = new Connection(process.env.HELIUS_RPC_URL || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com')`
    );

    // Add Helius-specific features
    const heliusEnhancements = `
  // Helius Enhanced Features
  async getEnhancedAccountInfo(address) {
    if (process.env.HELIUS_API_KEY) {
      try {
        const response = await axios.get(\`https://api.helius.xyz/v0/addresses/\${address}?api-key=\${process.env.HELIUS_API_KEY}\`);
        return response.data;
      } catch (e) {
        console.log('⚠️ Helius enhanced API not available, using standard RPC');
      }
    }
    return await this.connection.getAccountInfo(new PublicKey(address));
  }

  async parseTransactionWithHelius(signature) {
    if (process.env.HELIUS_API_KEY) {
      try {
        const response = await axios.get(\`https://api.helius.xyz/v0/transactions/\${signature}?api-key=\${process.env.HELIUS_API_KEY}\`);
        return response.data;
      } catch (e) {
        console.log('⚠️ Helius transaction parsing not available');
      }
    }
    return await this.connection.getTransaction(signature);
  }
`;

    // Insert Helius enhancements before the last class closing brace
    const enhancedScript = updatedScript.replace(
      /(\s+)(\}\s*\/\/ CLI interface)/,
      `$1${heliusEnhancements}$1$2`
    );

    if (enhancedScript !== deployScript) {
      fs.writeFileSync(solanaDeployPath, enhancedScript);
      console.log('✅ Enhanced Solana deployment script with Helius features');
    }

  } catch (e) {
    console.log('❌ Could not update Solana deployment script:', e.message);
  }

  // Create Helius integration utility
  const heliusUtilPath = path.join(futuristicPath, 'helius-integration.js');
  
  const heliusUtilContent = `#!/usr/bin/env node

const { Connection } = require('@solana/web3.js');
const axios = require('axios');

class HeliusIntegration {
  constructor() {
    this.apiKey = process.env.HELIUS_API_KEY;
    this.rpcUrl = process.env.HELIUS_RPC_URL;
    this.connection = new Connection(this.rpcUrl || 'https://api.mainnet-beta.solana.com');
    
    if (!this.apiKey) {
      console.log('⚠️ HELIUS_API_KEY not configured - using standard RPC only');
    }
  }

  async getEnhancedTransactions(address, limit = 10) {
    if (!this.apiKey) return null;
    
    try {
      const response = await axios.get(\`https://api.helius.xyz/v0/addresses/\${address}/transactions?api-key=\${this.apiKey}&limit=\${limit}\`);
      return response.data;
    } catch (e) {
      console.error('Helius enhanced transactions failed:', e.message);
      return null;
    }
  }

  async parseTransaction(signature) {
    if (!this.apiKey) {
      return await this.connection.getTransaction(signature);
    }
    
    try {
      const response = await axios.get(\`https://api.helius.xyz/v0/transactions/\${signature}?api-key=\${this.apiKey}\`);
      return response.data;
    } catch (e) {
      console.error('Helius transaction parsing failed:', e.message);
      return await this.connection.getTransaction(signature);
    }
  }

  async setupWebhook(webhookUrl, addresses) {
    if (!this.apiKey) {
      console.log('❌ Helius API key required for webhooks');
      return null;
    }

    try {
      const response = await axios.post(\`https://api.helius.xyz/v0/webhooks?api-key=\${this.apiKey}\`, {
        webhookURL: webhookUrl,
        transactionTypes: ['Any'],
        accountAddresses: addresses,
        webhookType: 'enhanced'
      });
      
      console.log('✅ Helius webhook created:', response.data.webhookID);
      return response.data;
    } catch (e) {
      console.error('Helius webhook setup failed:', e.message);
      return null;
    }
  }
}

module.exports = HeliusIntegration;
`;

  fs.writeFileSync(heliusUtilPath, heliusUtilContent);
  console.log('✅ Created Helius integration utility');

  // Update package.json scripts
  const packageJsonPath = path.join(futuristicPath, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) packageJson.scripts = {};
    
    // Add Helius-specific scripts
    packageJson.scripts['helius:test'] = 'node helius-integration.js';
    packageJson.scripts['deploy:helius'] = 'HELIUS_RPC_URL=$HELIUS_RPC_URL node solana_zero_cost_deploy.js deploy';
    packageJson.scripts['deploy:enhanced'] = 'node solana_zero_cost_deploy.js deploy';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added Helius scripts to package.json');
    
  } catch (e) {
    console.log('❌ Could not update package.json:', e.message);
  }

  console.log('\n🎯 INTEGRATION SUMMARY:');
  console.log('✅ Helius RPC configuration added to Futuristic Kami');
  console.log('✅ Enhanced Solana deployment script with Helius features');
  console.log('✅ Created Helius integration utility');
  console.log('✅ Added Helius-specific npm scripts');
  
  console.log('\n🚀 USAGE:');
  console.log('cd The-Futuristic-Kami-Omni-Engine');
  console.log('npm run deploy:helius    # Deploy using Helius RPC');
  console.log('npm run helius:test      # Test Helius integration');
  
  return true;
}

integrateHeliusToFuturistic();