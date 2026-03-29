#!/usr/bin/env node

/**
 * Solana On-Chain Program Verification Tool
 * Checks if programs are actually running on Solana mainnet
 * 
 * Usage: node verify-programs-onchain.js
 */

const https = require('https');
const fs = require('fs');

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Programs to verify
const PROGRAMS = [
  {
    name: 'Vote Program',
    id: 'Votejju1omngnwg',
    deploymentId: 'Votejju1omngnwg'
  },
  {
    name: 'NFT Collection (OPVN)',
    id: 'NFTfhr4ph5w0ug',
    deploymentId: 'NFTfhr4ph5w0ug'
  },
  {
    name: 'Bot #1: Vote Harvester',
    id: 'Botzcv45lq3rar',
    deploymentId: 'BOTake4d6i3yae'
  },
  {
    name: 'Bot #2: Reward Claimer',
    id: 'Botgy74odomne',
    deploymentId: 'BOToyvwrcudit8'
  },
  {
    name: 'Bot #3: NFT Trader',
    id: 'Botfpocp7jkxr',
    deploymentId: 'BOT7ihru1xgn3h'
  },
  {
    name: 'Bot #4: Yield Farmer',
    id: 'Botbsm7et3k5r',
    deploymentId: 'BOTd6bn1ovijnv'
  },
  {
    name: 'Bot #5: Governance Voter',
    id: 'Botnk1s2xskl7',
    deploymentId: 'BOTm93gpq85zb'
  }
];

const AUTHORITY_ADDRESS = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

/**
 * Make RPC call to Solana
 */
function makeRpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: method,
      params: params || []
    });

    const options = {
      hostname: 'api.mainnet-beta.solana.com',
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Check if address is valid base58
 */
function isValidBase58(str) {
  const base58Regex = /^[1-9A-HJ-NP-Z]+$/;
  return base58Regex.test(str) && str.length === 44;
}

/**
 * Verify a single program
 */
async function verifyProgram(program) {
  console.log(`\n📡 Checking: ${program.name}`);
  console.log(`   ID: ${program.id}`);

  const isValid = isValidBase58(program.id);
  
  if (!isValid) {
    console.log(`   ${colors.red}✗ INVALID ADDRESS${colors.reset}`);
    console.log(`   └─ Not a valid Solana address (expected 44-char base58)`);
    return {
      name: program.name,
      id: program.id,
      valid: false,
      exists: false,
      reason: 'Invalid address format',
      explorerUrl: `https://explorer.solana.com/address/${program.id}?cluster=mainnet`
    };
  }

  try {
    // Try to get account info
    const response = await makeRpcCall('getAccountInfo', [program.id]);
    
    if (response.error) {
      console.log(`   ${colors.red}✗ NOT FOUND${colors.reset}`);
      console.log(`   └─ Program not deployed on mainnet`);
      return {
        name: program.name,
        id: program.id,
        valid: true,
        exists: false,
        reason: 'Program not found on-chain',
        explorerUrl: `https://explorer.solana.com/address/${program.id}?cluster=mainnet`
      };
    }

    if (response.result && response.result.value) {
      const account = response.result.value;
      console.log(`   ${colors.green}✓ FOUND${colors.reset}`);
      console.log(`   ├─ Owner: ${account.owner}`);
      console.log(`   ├─ Balance: ${account.lamports / 1e9} SOL`);
      console.log(`   ├─ Executable: ${account.executable}`);
      return {
        name: program.name,
        id: program.id,
        valid: true,
        exists: true,
        owner: account.owner,
        lamports: account.lamports,
        executable: account.executable,
        explorerUrl: `https://explorer.solana.com/address/${program.id}?cluster=mainnet`
      };
    }

    return {
      name: program.name,
      id: program.id,
      valid: true,
      exists: false,
      reason: 'Empty response',
      explorerUrl: `https://explorer.solana.com/address/${program.id}?cluster=mainnet`
    };
  } catch (error) {
    console.log(`   ${colors.yellow}⚠ ERROR${colors.reset}`);
    console.log(`   └─ ${error.message}`);
    return {
      name: program.name,
      id: program.id,
      valid: true,
      exists: false,
      reason: `Network error: ${error.message}`,
      explorerUrl: `https://explorer.solana.com/address/${program.id}?cluster=mainnet`
    };
  }
}

/**
 * Verify authority address
 */
async function verifyAuthority() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔐 AUTHORITY ADDRESS VERIFICATION`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nAddress: ${AUTHORITY_ADDRESS}`);

  const isValid = isValidBase58(AUTHORITY_ADDRESS);
  
  if (!isValid) {
    console.log(`${colors.red}✗ INVALID${colors.reset} - Not a valid Solana address`);
    return {
      address: AUTHORITY_ADDRESS,
      valid: false,
      exists: false,
      reason: 'Invalid address format'
    };
  }

  try {
    const response = await makeRpcCall('getAccountInfo', [AUTHORITY_ADDRESS]);
    
    if (response.error) {
      console.log(`${colors.red}✗ NOT FOUND${colors.reset} on mainnet`);
      return {
        address: AUTHORITY_ADDRESS,
        valid: true,
        exists: false,
        reason: 'Address not found on-chain'
      };
    }

    if (response.result && response.result.value) {
      console.log(`${colors.green}✓ FOUND${colors.reset}`);
      const account = response.result.value;
      console.log(`  ├─ Balance: ${account.lamports / 1e9} SOL`);
      console.log(`  ├─ Owner: ${account.owner}`);
      console.log(`  └─ Executable: ${account.executable}`);
      return {
        address: AUTHORITY_ADDRESS,
        valid: true,
        exists: true,
        balance: account.lamports / 1e9,
        owner: account.owner,
        executable: account.executable
      };
    }

    return {
      address: AUTHORITY_ADDRESS,
      valid: true,
      exists: false,
      reason: 'Empty response'
    };
  } catch (error) {
    console.log(`${colors.yellow}⚠ ERROR${colors.reset}: ${error.message}`);
    return {
      address: AUTHORITY_ADDRESS,
      valid: true,
      exists: false,
      reason: error.message
    };
  }
}

/**
 * Main verification flow
 */
async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${colors.cyan}SOLANA ON-CHAIN PROGRAM VERIFICATION${colors.reset}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nNetwork: ${colors.cyan}Solana Mainnet${colors.reset}`);
  console.log(`RPC: ${colors.cyan}${RPC_ENDPOINT}${colors.reset}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  // Verify authority first
  const authorityResult = await verifyAuthority();

  // Verify each program
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📡 PROGRAM VERIFICATION RESULTS`);
  console.log(`${'='.repeat(80)}`);

  const results = [];
  for (const program of PROGRAMS) {
    const result = await verifyProgram(program);
    results.push(result);
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 VERIFICATION SUMMARY`);
  console.log(`${'='.repeat(80)}`);

  const foundCount = results.filter(r => r.exists).length;
  const validCount = results.filter(r => r.valid).length;
  
  console.log(`\nTotal Programs: ${results.length}`);
  console.log(`Valid Addresses: ${colors.cyan}${validCount}${colors.reset}`);
  console.log(`Found On-Chain: ${colors.green}${foundCount}${colors.reset}`);
  console.log(`Not Found: ${colors.red}${results.length - foundCount}${colors.reset}`);

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    network: 'solana-mainnet',
    rpc: RPC_ENDPOINT,
    summary: {
      total_programs: results.length,
      valid_addresses: validCount,
      found_onchain: foundCount,
      not_found: results.length - foundCount
    },
    authority: authorityResult,
    programs: results,
    explorer_base: 'https://explorer.solana.com'
  };

  // Save report
  const reportPath = '.cache/solana-onchain-verification.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved to: ${reportPath}`);

  // Display explorer links
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔗 EXPLORER LINKS (Click to verify manually)`);
  console.log(`${'='.repeat(80)}`);

  console.log(`\nAuthority Address:`);
  console.log(`  https://explorer.solana.com/address/${AUTHORITY_ADDRESS}?cluster=mainnet\n`);

  console.log(`Programs:`);
  results.forEach(r => {
    const status = r.exists ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`  ${status} ${r.name}`);
    console.log(`     ${r.explorerUrl}\n`);
  });

  // Final recommendation
  console.log(`${'='.repeat(80)}`);
  console.log(`💡 INTERPRETATION`);
  console.log(`${'='.repeat(80)}`);
  
  if (foundCount === 0) {
    console.log(`\n${colors.red}❌ IMPORTANT: No programs found on Solana mainnet${colors.reset}`);
    console.log(`\nThe program addresses appear to be placeholder/encoded format:`);
    console.log(`  • Votejju1omngnwg (Vote Program)`);
    console.log(`  • NFTfhr4ph5w0ug (NFT Collection)`);
    console.log(`  • Botzcv45lq3rar, Botgy74odomne, etc. (Bots)`);
    console.log(`\n${colors.yellow}Possible Reasons:${colors.reset}`);
    console.log(`  1. Programs not yet deployed to mainnet`);
    console.log(`  2. Addresses are encoded/placeholder format (not real base58)`);
    console.log(`  3. Programs may be on devnet instead of mainnet`);
    console.log(`  4. Programs have different addresses than deployment data`);
    console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
    console.log(`  • Verify actual program addresses with your deployment team`);
    console.log(`  • Check devnet deployment status`);
    console.log(`  • Review deployment logs for real program IDs`);
  } else if (foundCount === results.length) {
    console.log(`\n${colors.green}✅ SUCCESS: All programs verified on mainnet${colors.reset}`);
    console.log(`All programs are deployed and running.`);
  } else {
    console.log(`\n${colors.yellow}⚠️  PARTIAL: ${foundCount}/${results.length} programs found${colors.reset}`);
    console.log(`Some programs are deployed, others are not.`);
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

// Run verification
main().catch(error => {
  console.error(`\n${colors.red}Fatal Error:${colors.reset}`, error.message);
  process.exit(1);
});
