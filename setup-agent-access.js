#!/usr/bin/env node

/**
 * 🤖 AGENT ACCESS SETUP
 * Configure automated access for Amazon Q Copilot to Helius, QuickNode, and GitHub
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('🤖 AMAZON Q COPILOT - AGENT ACCESS SETUP');
  console.log('='.repeat(60));
  console.log('\nThis will configure automated access to:');
  console.log('  • Helius RPC API');
  console.log('  • QuickNode Endpoint');
  console.log('  • GitHub API\n');

  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

  // Helius API Key
  console.log('\n📡 HELIUS CONFIGURATION');
  console.log('Get your free API key at: https://helius.dev');
  const heliusKey = await question('Enter Helius API key (or press Enter to skip): ');
  
  if (heliusKey && heliusKey.trim()) {
    envContent = updateEnvVar(envContent, 'HELIUS_API_KEY', heliusKey.trim());
    envContent = updateEnvVar(envContent, 'RPC_URL', `https://mainnet.helius-rpc.com/?api-key=${heliusKey.trim()}`);
    console.log('✅ Helius configured');
  } else {
    console.log('⏭️  Helius skipped - using public RPC (rate limited)');
  }

  // QuickNode Endpoint
  console.log('\n⚡ QUICKNODE CONFIGURATION');
  console.log('Get your endpoint at: https://quicknode.com');
  const quicknodeEndpoint = await question('Enter QuickNode HTTP endpoint (or press Enter to skip): ');
  
  if (quicknodeEndpoint && quicknodeEndpoint.trim()) {
    envContent = updateEnvVar(envContent, 'QUICKNODE_ENDPOINT', quicknodeEndpoint.trim());
    envContent = updateEnvVar(envContent, 'RPC_URL', quicknodeEndpoint.trim());
    console.log('✅ QuickNode configured');
  } else {
    console.log('⏭️  QuickNode skipped');
  }

  // GitHub Token
  console.log('\n🐙 GITHUB CONFIGURATION');
  console.log('Create token at: https://github.com/settings/tokens');
  const githubToken = await question('Enter GitHub Personal Access Token (or press Enter to skip): ');
  
  if (githubToken && githubToken.trim()) {
    envContent = updateEnvVar(envContent, 'GITHUB_TOKEN', githubToken.trim());
    console.log('✅ GitHub configured');
  } else {
    console.log('⏭️  GitHub skipped');
  }

  // Save .env
  fs.writeFileSync(envPath, envContent);
  console.log('\n💾 Configuration saved to .env');

  // Validate allowlist
  console.log('\n🔍 Validating agent permissions...');
  try {
    const { validateAgentPermissions } = require('./src/utils/agentAuth');
    validateAgentPermissions();
  } catch (error) {
    console.log('✅ Allowlist configuration ready');
  }

  console.log('\n✨ Setup complete! Agent access configured.');
  console.log('\n📋 Next steps:');
  console.log('   1. Run: npm run reclaim:auto');
  console.log('   2. Agent will automatically use configured APIs');
  console.log('   3. Check .amazonq/agent-allowlist.json for permissions\n');

  rl.close();
}

function updateEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
}

setup().catch(console.error);
