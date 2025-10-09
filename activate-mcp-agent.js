#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🤖 ACTIVATING MCP AGENT - DEPLOYER GENE');
console.log('=====================================');

// Load environment
require('dotenv').config();

const mcpConfig = {
  timestamp: new Date().toISOString(),
  agent: {
    name: 'deployer-gene-mcp',
    version: '1.0.0',
    status: 'ACTIVE',
    capabilities: [
      'solana-web3',
      'spl-token', 
      'metaplex',
      'relayer-zero-cost'
    ]
  },
  servers: {
    'solana-web3': {
      enabled: true,
      rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
      network: 'mainnet-beta'
    },
    'relayer': {
      enabled: true,
      url: process.env.RELAYER_URL,
      pubkey: process.env.RELAYER_PUBKEY,
      hasApiKey: !!process.env.RELAYER_API_KEY
    }
  },
  deployment: {
    mode: 'mainnet-only',
    zeroCost: true,
    signerOnly: true,
    relayerRequired: true
  }
};

// Save MCP configuration
const cacheDir = '.cache';
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

fs.writeFileSync(
  path.join(cacheDir, 'mcp-agent-config.json'),
  JSON.stringify(mcpConfig, null, 2)
);

console.log('✅ MCP Agent Configuration:');
console.log(`   Status: ${mcpConfig.agent.status}`);
console.log(`   Network: ${mcpConfig.servers['solana-web3'].network}`);
console.log(`   Relayer: ${mcpConfig.servers.relayer.enabled ? 'ENABLED' : 'DISABLED'}`);
console.log(`   Zero-Cost: ${mcpConfig.deployment.zeroCost ? 'YES' : 'NO'}`);

console.log('\n🚀 MCP Agent is now ACTIVE and ready for deployment!');
console.log('\n📋 Available Commands:');
console.log('   npm run mainnet:bot-orchestrate  # Deploy bot army');
console.log('   npm run mainnet:verify-bots      # Verify deployments');
console.log('   npm run mainnet:copilot          # Interactive mode');

// Export for other scripts
module.exports = mcpConfig;