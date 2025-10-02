import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { getSecureConfig, logSecurityWarnings } from './securityConfig';
import { getValidatedRpcUrl } from './allowlist';

dotenv.config();

async function checkEnv() {
  console.log('🔒 Enhanced Security Environment Check');
  console.log('=====================================');
  
  try {
    // Use the new security configuration
    const config = getSecureConfig();
    
    // Log security warnings
    logSecurityWarnings();
    
    // Validate RPC endpoint against allowlist
    const validatedRpcUrl = getValidatedRpcUrl(config.rpcUrlWithKey);
    
    // Test RPC connection
    const connection = new Connection(validatedRpcUrl, 'confirmed');
    await connection.getLatestBlockhash();
    console.log('✅ RPC connection successful');
    
    console.log('✅ All environment variables validated successfully');
    console.log('🛡️  Security configuration is properly set up');
    
  } catch (e: any) {
    console.error('❌ Environment check failed:', e.message);
    throw e;
  }
}

checkEnv().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
