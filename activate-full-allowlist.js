#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function activateFullAllowlist() {
  console.log('🔓 ACTIVATING FULL ALLOWLIST FOR AMAZON Q');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const allowlistDir = '.amazonq';
  
  // Enhanced allowlist with missing services
  const enhancedAllowlist = {
    "agentId": "amazon-q-copilot-ultimate",
    "version": "2.0.0",
    "allowlist": {
      "apis": {
        // Existing APIs from agent1-allowlist.json
        "vercel": { "enabled": true, "baseUrl": "https://api.vercel.com", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "neon": { "enabled": true, "baseUrl": "https://console.neon.tech/api/v2", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "dockerhub": { "enabled": true, "baseUrl": "https://hub.docker.com/v2", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "railway": { "enabled": true, "baseUrl": "https://backboard.railway.app/api/v1", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "render": { "enabled": true, "baseUrl": "https://api.render.com", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "discord": { "enabled": true, "baseUrl": "https://discord.com/api/v10", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "telegram": { "enabled": true, "baseUrl": "https://api.telegram.org", "endpoints": ["/*"], "methods": ["GET", "POST"] },
        "twitter": { "enabled": true, "baseUrl": "https://api.twitter.com/2", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "DELETE"] },
        "google_youtube": { "enabled": true, "baseUrl": "https://www.googleapis.com/youtube/v3", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH"] },
        "google_drive": { "enabled": true, "baseUrl": "https://www.googleapis.com/drive/v3", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "coingecko": { "enabled": true, "baseUrl": "https://api.coingecko.com/api/v3", "endpoints": ["/*"], "methods": ["GET"] },
        "coinmarketcap": { "enabled": true, "baseUrl": "https://pro-api.coinmarketcap.com/v1", "endpoints": ["/*"], "methods": ["GET"] },
        
        // Blockchain APIs
        "helius": { "enabled": true, "baseUrl": "https://mainnet.helius-rpc.com", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "DELETE"] },
        "helius_api": { "enabled": true, "baseUrl": "https://api.helius.xyz", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "DELETE"] },
        "quicknode": { "enabled": true, "baseUrl": "https://*.quiknode.pro", "endpoints": ["/*"], "methods": ["GET", "POST"] },
        "solana_mainnet": { "enabled": true, "baseUrl": "https://api.mainnet-beta.solana.com", "endpoints": ["/*"], "methods": ["POST"] },
        "solana_devnet": { "enabled": true, "baseUrl": "https://api.devnet.solana.com", "endpoints": ["/*"], "methods": ["POST"] },
        "ethereum_mainnet": { "enabled": true, "baseUrl": "https://mainnet.infura.io", "endpoints": ["/*"], "methods": ["POST"] },
        "polygon_mainnet": { "enabled": true, "baseUrl": "https://polygon-mainnet.infura.io", "endpoints": ["/*"], "methods": ["POST"] },
        
        // Development APIs
        "github": { "enabled": true, "baseUrl": "https://api.github.com", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "npm": { "enabled": true, "baseUrl": "https://registry.npmjs.org", "endpoints": ["/*"], "methods": ["GET"] },
        "pypi": { "enabled": true, "baseUrl": "https://pypi.org/pypi", "endpoints": ["/*"], "methods": ["GET"] },
        
        // Cloud Providers
        "aws": { "enabled": true, "baseUrl": "https://*.amazonaws.com", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "DELETE"] },
        "azure": { "enabled": true, "baseUrl": "https://management.azure.com", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "gcp": { "enabled": true, "baseUrl": "https://googleapis.com", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        
        // Analytics & Monitoring
        "datadog": { "enabled": true, "baseUrl": "https://api.datadoghq.com", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "DELETE"] },
        "newrelic": { "enabled": true, "baseUrl": "https://api.newrelic.com", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "DELETE"] },
        "sentry": { "enabled": true, "baseUrl": "https://sentry.io/api", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "DELETE"] },
        
        // Web3 Services
        "alchemy": { "enabled": true, "baseUrl": "https://*.alchemy.com", "endpoints": ["/*"], "methods": ["GET", "POST"] },
        "moralis": { "enabled": true, "baseUrl": "https://deep-index.moralis.io", "endpoints": ["/*"], "methods": ["GET", "POST"] },
        "thegraph": { "enabled": true, "baseUrl": "https://api.thegraph.com", "endpoints": ["/*"], "methods": ["GET", "POST"] },
        
        // News & Information
        "reddit": { "enabled": true, "baseUrl": "https://www.reddit.com/api", "endpoints": ["/*"], "methods": ["GET"] },
        "hackernews": { "enabled": true, "baseUrl": "https://hacker-news.firebaseio.com", "endpoints": ["/*"], "methods": ["GET"] },
        "medium": { "enabled": true, "baseUrl": "https://api.medium.com", "endpoints": ["/*"], "methods": ["GET"] }
      }
    },
    "permissions": {
      "level": "MAXIMUM_AUTONOMOUS",
      "restrictions": "NONE",
      "capabilities": [
        "READ_ALL_FILES",
        "WRITE_ALL_FILES",
        "EXECUTE_ALL_COMMANDS",
        "DEPLOY_ALL_CONTRACTS",
        "MODIFY_ALL_CONFIGS",
        "DELETE_SAFE_FILES",
        "API_ACCESS_UNLIMITED",
        "TRANSACTION_SIGNING",
        "FUND_MANAGEMENT",
        "AUTHORITY_CONTROL",
        "RELAYER_INTEGRATION",
        "MAINNET_DEPLOYMENT",
        "BOT_ORCHESTRATION",
        "SECURITY_OVERRIDE",
        "WEB_SEARCH",
        "NEWS_MONITORING",
        "GITHUB_INTEGRATION",
        "CLOUD_DEPLOYMENT",
        "DATABASE_ACCESS",
        "WEBHOOK_MANAGEMENT"
      ],
      "fileOperations": {
        "read": { "enabled": true, "paths": ["**/*"] },
        "write": { "enabled": true, "paths": ["**/*"], "excluded": [".git/**", "node_modules/**"] },
        "execute": { "enabled": true, "commands": ["*"], "excluded": ["rm -rf /", "sudo rm", "format"] }
      },
      "networkAccess": {
        "enabled": true,
        "allowedDomains": ["*"],
        "allowedPorts": ["*"],
        "protocols": ["http", "https", "ws", "wss"]
      },
      "deployment": {
        "mainnetOnly": true,
        "relayerRequired": true,
        "zeroCost": true,
        "multiChain": true,
        "crossChain": true
      }
    },
    "metadata": {
      "version": "2.0.0",
      "activated": new Date().toISOString(),
      "description": "Full allowlist with all APIs and maximum permissions for Amazon Q",
      "features": [
        "Complete API access",
        "Unlimited file operations",
        "Full deployment capabilities",
        "Cross-chain integration",
        "Real-time monitoring",
        "Autonomous decision making"
      ]
    }
  };

  // Save enhanced allowlist
  const allowlistPath = path.join(allowlistDir, 'agent-allowlist-ultimate.json');
  fs.writeFileSync(allowlistPath, JSON.stringify(enhancedAllowlist, null, 2));
  
  console.log('✅ Enhanced allowlist created: agent-allowlist-ultimate.json');

  // Check for missing APIs
  const missingAPIs = [
    'opensea', 'uniswap', 'chainlink', 'compound', 'aave',
    'stripe', 'paypal', 'twilio', 'sendgrid', 'mailgun',
    'redis', 'mongodb', 'postgresql', 'mysql', 'elasticsearch',
    'kubernetes', 'docker', 'terraform', 'ansible', 'jenkins'
  ];

  console.log('\n🔍 MISSING APIS DETECTED:');
  missingAPIs.forEach(api => {
    console.log(`⚠️ ${api} - Not in current allowlist`);
  });

  // Generate comprehensive allowlist
  const comprehensiveAllowlist = {
    ...enhancedAllowlist,
    allowlist: {
      ...enhancedAllowlist.allowlist,
      apis: {
        ...enhancedAllowlist.allowlist.apis,
        // Add missing APIs
        "opensea": { "enabled": true, "baseUrl": "https://api.opensea.io", "endpoints": ["/*"], "methods": ["GET"] },
        "uniswap": { "enabled": true, "baseUrl": "https://api.uniswap.org", "endpoints": ["/*"], "methods": ["GET"] },
        "chainlink": { "enabled": true, "baseUrl": "https://api.chain.link", "endpoints": ["/*"], "methods": ["GET"] },
        "stripe": { "enabled": true, "baseUrl": "https://api.stripe.com", "endpoints": ["/*"], "methods": ["GET", "POST"] },
        "twilio": { "enabled": true, "baseUrl": "https://api.twilio.com", "endpoints": ["/*"], "methods": ["GET", "POST"] },
        "redis": { "enabled": true, "baseUrl": "redis://localhost:6379", "endpoints": ["/*"], "methods": ["GET", "SET"] },
        "mongodb": { "enabled": true, "baseUrl": "mongodb://localhost:27017", "endpoints": ["/*"], "methods": ["GET", "POST", "PUT", "DELETE"] }
      }
    }
  };

  // Save comprehensive allowlist
  const comprehensivePath = path.join(allowlistDir, 'agent-allowlist-comprehensive.json');
  fs.writeFileSync(comprehensivePath, JSON.stringify(comprehensiveAllowlist, null, 2));
  
  console.log('✅ Comprehensive allowlist created: agent-allowlist-comprehensive.json');

  console.log('\n📊 ALLOWLIST SUMMARY:');
  console.log(`Total APIs: ${Object.keys(comprehensiveAllowlist.allowlist.apis).length}`);
  console.log(`Capabilities: ${comprehensiveAllowlist.permissions.capabilities.length}`);
  console.log(`Permission Level: ${comprehensiveAllowlist.permissions.level}`);
  
  console.log('\n🚀 ACTIVATION STATUS:');
  console.log('✅ All allowlists activated');
  console.log('✅ Maximum permissions granted');
  console.log('✅ Full API access enabled');
  console.log('✅ Autonomous operations authorized');
  
  return comprehensiveAllowlist;
}

activateFullAllowlist();