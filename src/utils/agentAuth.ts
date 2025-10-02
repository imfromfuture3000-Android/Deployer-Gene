import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface AgentAllowlist {
  agentId: string;
  allowlist: {
    apis: Record<string, any>;
    fileOperations: any;
    commandExecution: any;
    secrets: any;
  };
  permissions: any;
}

/**
 * Load agent allowlist configuration
 */
export function loadAgentAllowlist(): AgentAllowlist {
  const allowlistPath = path.join(process.cwd(), '.amazonq', 'agent-allowlist.json');
  
  if (!fs.existsSync(allowlistPath)) {
    throw new Error('Agent allowlist not found. Run setup first.');
  }
  
  return JSON.parse(fs.readFileSync(allowlistPath, 'utf-8'));
}

/**
 * Check if agent has permission for API access
 */
export function hasApiAccess(apiName: string): boolean {
  const allowlist = loadAgentAllowlist();
  return allowlist.allowlist.apis[apiName]?.enabled || false;
}

/**
 * Get API configuration for agent
 */
export function getApiConfig(apiName: string) {
  const allowlist = loadAgentAllowlist();
  return allowlist.allowlist.apis[apiName];
}

/**
 * Setup Helius API access
 */
export function setupHeliusAccess(): { apiKey: string; rpcUrl: string } {
  if (!hasApiAccess('helius')) {
    throw new Error('Helius API access not allowed');
  }
  
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey || apiKey === 'your_helius_api_key_here') {
    console.warn('⚠️  HELIUS_API_KEY not configured. Using public RPC.');
    return {
      apiKey: '',
      rpcUrl: 'https://api.mainnet-beta.solana.com'
    };
  }
  
  return {
    apiKey,
    rpcUrl: `https://mainnet.helius-rpc.com/?api-key=${apiKey}`
  };
}

/**
 * Setup QuickNode access
 */
export function setupQuickNodeAccess(): { endpoint: string } {
  if (!hasApiAccess('quicknode')) {
    throw new Error('QuickNode API access not allowed');
  }
  
  const endpoint = process.env.QUICKNODE_ENDPOINT || process.env.WSS_URL;
  if (!endpoint || endpoint.includes('your-')) {
    console.warn('⚠️  QUICKNODE_ENDPOINT not configured.');
    return { endpoint: '' };
  }
  
  return { endpoint };
}

/**
 * Setup GitHub access
 */
export function setupGitHubAccess(): { token: string; baseUrl: string } {
  if (!hasApiAccess('github')) {
    throw new Error('GitHub API access not allowed');
  }
  
  const token = process.env.GITHUB_TOKEN || '';
  
  return {
    token,
    baseUrl: 'https://api.github.com'
  };
}

/**
 * Validate agent permissions
 */
export function validateAgentPermissions(): boolean {
  try {
    const allowlist = loadAgentAllowlist();
    console.log('✅ Agent allowlist loaded');
    console.log(`   Agent ID: ${allowlist.agentId}`);
    console.log(`   APIs enabled: ${Object.keys(allowlist.allowlist.apis).filter(k => allowlist.allowlist.apis[k].enabled).join(', ')}`);
    console.log(`   Deployment: ${allowlist.permissions.deployment.canDeploy ? 'Enabled' : 'Disabled'}`);
    console.log(`   Automation: ${allowlist.permissions.automation.canExecuteScripts ? 'Enabled' : 'Disabled'}`);
    return true;
  } catch (error) {
    console.error('❌ Agent permission validation failed:', error);
    return false;
  }
}
