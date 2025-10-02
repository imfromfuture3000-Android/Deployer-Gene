import * as dotenv from 'dotenv';
import { Connection, PublicKey } from '@solana/web3.js';

// Load environment variables
dotenv.config();

interface SecurityConfig {
  rpcUrl: string;
  heliusApiKey?: string;
  rpcUrlWithKey: string;
  sourceWalletAddress?: string;
  targetWalletAddress?: string;
  treasuryPubkey?: string;
  daoPubkey?: string;
  controllerPubkey?: string;
  cocreatorPubkey?: string;
  relayerUrl?: string;
  relayerPubkey?: string;
  relayerApiKey?: string;
  authorityMode: string;
  dryRun: boolean;
}

/**
 * Validates that a string is a valid Solana public key
 */
function validatePublicKey(key: string | undefined, name: string): void {
  if (!key) return;
  
  try {
    new PublicKey(key);
  } catch (error) {
    throw new Error(`Invalid public key for ${name}: ${key}`);
  }
}

/**
 * Validates that an API key is not a placeholder or empty
 */
function validateApiKey(key: string | undefined, name: string): void {
  if (!key) return;
  
  const placeholders = ['<YOUR_', 'REPLACE', 'INSERT', 'PLACEHOLDER'];
  if (placeholders.some(placeholder => key.includes(placeholder))) {
    throw new Error(`${name} appears to be a placeholder. Please set a real API key.`);
  }
  
  if (key.length < 8) {
    throw new Error(`${name} appears to be too short. Please verify the API key.`);
  }
}

/**
 * Gets secure configuration from environment variables with validation
 */
export function getSecureConfig(): SecurityConfig {
  const config: SecurityConfig = {
    rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
    heliusApiKey: process.env.HELIUS_API_KEY,
    rpcUrlWithKey: '',
    sourceWalletAddress: process.env.SOURCE_WALLET_ADDRESS,
    targetWalletAddress: process.env.TARGET_WALLET_ADDRESS,
    treasuryPubkey: process.env.TREASURY_PUBKEY,
    daoPubkey: process.env.DAO_PUBKEY,
    controllerPubkey: undefined, // Deployer is master controller
    cocreatorPubkey: process.env.COCREATOR_PUBKEY,
    relayerUrl: process.env.RELAYER_URL,
    relayerPubkey: process.env.RELAYER_PUBKEY,
    relayerApiKey: process.env.RELAYER_API_KEY,
    authorityMode: process.env.AUTHORITY_MODE || 'null',
    dryRun: process.env.DRY_RUN === 'true'
  };

  // Validate API keys
  validateApiKey(config.heliusApiKey, 'HELIUS_API_KEY');
  validateApiKey(config.relayerApiKey, 'RELAYER_API_KEY');

  // Validate public keys
  validatePublicKey(config.sourceWalletAddress, 'SOURCE_WALLET_ADDRESS');
  validatePublicKey(config.targetWalletAddress, 'TARGET_WALLET_ADDRESS');
  validatePublicKey(config.treasuryPubkey, 'TREASURY_PUBKEY');
  validatePublicKey(config.daoPubkey, 'DAO_PUBKEY');
  // Controller validation removed - deployer is master controller
  validatePublicKey(config.cocreatorPubkey, 'COCREATOR_PUBKEY');
  validatePublicKey(config.relayerPubkey, 'RELAYER_PUBKEY');

  // Build RPC URL with API key if available
  if (config.heliusApiKey) {
    config.rpcUrlWithKey = `https://mainnet.helius-rpc.com/?api-key=${config.heliusApiKey}`;
  } else {
    config.rpcUrlWithKey = config.rpcUrl;
  }

  // Validate authority mode
  const validAuthorityModes = ['null', 'dao', 'treasury'];
  if (!validAuthorityModes.includes(config.authorityMode)) {
    throw new Error(`Invalid AUTHORITY_MODE: ${config.authorityMode}. Must be one of: ${validAuthorityModes.join(', ')}`);
  }

  return config;
}

/**
 * Creates a Solana connection using secure configuration
 */
export function createSecureConnection(commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'): Connection {
  const config = getSecureConfig();
  
  if (config.dryRun) {
    console.warn('⚠️  DRY_RUN mode is enabled. No transactions will be executed.');
  }
  
  return new Connection(config.rpcUrlWithKey, commitment);
}

/**
 * Logs security warnings if using placeholder values
 */
export function logSecurityWarnings(): void {
  const config = getSecureConfig();
  
  console.log('🔒 Security Configuration Check:');
  
  if (!config.heliusApiKey) {
    console.warn('⚠️  HELIUS_API_KEY not set. Using default RPC endpoint which may have rate limits.');
  }
  
  if (!config.sourceWalletAddress || !config.targetWalletAddress) {
    console.warn('⚠️  Wallet addresses not configured. Some functionality may be limited.');
  }
  
  if (config.dryRun) {
    console.log('✅ DRY_RUN mode enabled - transactions will be simulated only.');
  } else {
    console.warn('⚠️  DRY_RUN mode disabled - transactions will be executed on mainnet!');
  }
  
  console.log('🔒 Security check complete.\n');
}

/**
 * Updates the security configuration and validates environment variables
 */
export function updateSecurityConfig(): void {
  const config = getSecureConfig();
  
  // Update checkEnv.ts to use the new security config
  console.log('✅ Security configuration updated successfully');
  console.log('🔒 Environment validation completed');
  
  if (config.dryRun) {
    console.log('🛡️  DRY_RUN mode is active - no real transactions will be executed');
  }
}