#!/usr/bin/env node

/**
 * Complete Program Scanner & Analyzer
 * Scans all Solana programs deployed by the DAO
 */

const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const RPC_URL = 'https://api.mainnet-beta.solana.com';

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║            📡 COMPLETE PROGRAM SCANNER & ANALYZER 📡        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

/**
 * Scan codebase for program references
 */
function scanCodebaseForPrograms() {
  console.log('🔍 SCANNING CODEBASE FOR PROGRAM REFERENCES');
  console.log('─'.repeat(65));

  const programs = new Map();
  const extensions = ['.js', '.ts', '.json', '.md'];
  
  function searchDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.startsWith('.')) return;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!['node_modules', '.git', '.cache', 'dist', 'build'].includes(file)) {
            searchDir(fullPath);
          }
        } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Search for Solana addresses (44-char base58)
          const addressRegex = /[1-9A-HJ-NP-Z]{44}/g;
          const matches = content.match(addressRegex) || [];
          
          matches.forEach(addr => {
            if (!programs.has(addr)) {
              programs.set(addr, { files: [], count: 0 });
            }
            const prog = programs.get(addr);
            if (!prog.files.includes(fullPath)) {
              prog.files.push(fullPath);
            }
            prog.count++;
          });
        }
      });
    } catch (e) {
      // Skip permission errors
    }
  }

  searchDir('.');

  return programs;
}

/**
 * Extract known programs from deployment data
 */
function getDeploymentPrograms() {
  console.log('📋 LOADING DEPLOYMENT DATA');
  console.log('─'.repeat(65));

  const programs = {};

  try {
    const deployment = JSON.parse(
      fs.readFileSync('.cache/node-votes-nft-bots-deployment.json', 'utf8')
    );

    // Extract program IDs
    programs['vote_program'] = {
      address: deployment.deployment.voteNode.programId,
      name: 'Vote Program',
      authority: deployment.deployment.voteNode.authority,
      commission: deployment.deployment.voteNode.commission,
      features: deployment.deployment.voteNode.features,
      network: deployment.network,
      status: 'active',
      source: 'deployment.voteNode.programId'
    };

    programs['nft_collection'] = {
      address: deployment.deployment.nftCollection.collectionId,
      name: 'NFT Collection',
      symbol: deployment.deployment.nftCollection.symbol,
      supply: deployment.deployment.nftCollection.totalSupply,
      royalty: deployment.deployment.nftCollection.royalty,
      features: deployment.deployment.nftCollection.features,
      network: deployment.network,
      status: 'active',
      source: 'deployment.nftCollection.collectionId'
    };

    // Bot programs
    deployment.deployment.bots.forEach((bot, i) => {
      programs[`bot_${i + 1}`] = {
        address: bot.address,
        botId: bot.botId,
        type: bot.type,
        name: `Bot ${i + 1} (${bot.type})`,
        earningRate: bot.earningRate,
        capabilities: bot.capabilities,
        network: deployment.network,
        status: 'active',
        source: `deployment.bots[${i}]`
      };
    });

    console.log(`✅ Loaded ${Object.keys(programs).length} programs from deployment data`);

  } catch (error) {
    console.log(`⚠️  Could not load deployment data: ${error.message}`);
  }

  return programs;
}

/**
 * Query program info from on-chain
 */
async function queryProgramInfo(address) {
  try {
    const connection = new Connection(RPC_URL);
    const pubkey = new PublicKey(address);
    
    const accountInfo = await connection.getAccountInfo(pubkey);
    
    if (!accountInfo) {
      return { exists: false };
    }

    return {
      exists: true,
      owner: accountInfo.owner.toBase58(),
      executable: accountInfo.executable,
      lamports: accountInfo.lamports,
      dataSize: accountInfo.data.length,
      rentEpoch: accountInfo.rentEpoch
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Get program authority/owner
 */
async function getProgramAuthority(address) {
  try {
    const connection = new Connection(RPC_URL);
    const pubkey = new PublicKey(address);
    
    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) return null;

    return {
      owner: accountInfo.owner.toBase58(),
      executable: accountInfo.executable,
      lamports: accountInfo.lamports
    };
  } catch (error) {
    return null;
  }
}

/**
 * Main scan function
 */
async function main() {
  // 1. Get deployment programs
  const deploymentPrograms = getDeploymentPrograms();

  // 2. Scan codebase
  console.log('\n');
  const codebasePrograms = scanCodebaseForPrograms();
  console.log(`✅ Found ${codebasePrograms.size} unique addresses in codebase`);

  // 3. Create consolidated list
  const allPrograms = { ...deploymentPrograms };

  // Add frequently referenced codebase addresses
  let addedCount = 0;
  codebasePrograms.forEach((prog, addr) => {
    if (prog.count >= 2 && !Object.values(allPrograms).find(p => p.address === addr)) {
      allPrograms[`codebase_ref_${addedCount++}`] = {
        address: addr,
        name: `Codebase Reference (${prog.count} mentions)`,
        references: prog.count,
        files: prog.files.slice(0, 3),
        source: 'codebase_scan'
      };
    }
  });

  // 4. Query on-chain for each program
  console.log('\n📡 QUERYING ON-CHAIN PROGRAM INFO');
  console.log('─'.repeat(65));

  const programDetails = {};
  
  for (const [key, prog] of Object.entries(allPrograms)) {
    if (!prog.address) continue;

    process.stdout.write(`  ${prog.name || key}... `);
    
    const info = await queryProgramInfo(prog.address);
    programDetails[prog.address] = {
      ...prog,
      onChain: info
    };

    if (info.exists) {
      console.log('✅ FOUND');
    } else if (info.error) {
      console.log(`⚠️  ERROR: ${info.error}`);
    } else {
      console.log('❌ NOT FOUND');
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 100));
  }

  // 5. Generate report
  console.log('\n\n📊 PROGRAM INVENTORY REPORT');
  console.log('═'.repeat(65));

  let activeCount = 0;
  let totalPrograms = 0;

  Object.entries(programDetails).forEach(([addr, prog]) => {
    if (!prog.address) return;
    
    totalPrograms++;
    const isActive = prog.onChain?.exists;
    if (isActive) activeCount++;

    console.log(`\n${totalPrograms}. ${prog.name || 'Unknown Program'}`);
    console.log(`   Address: ${prog.address}`);
    
    if (prog.authority) console.log(`   Authority: ${prog.authority.slice(0, 16)}...`);
    if (prog.symbol) console.log(`   Symbol: ${prog.symbol}`);
    if (prog.supply) console.log(`   Supply: ${prog.supply.toLocaleString()}`);
    if (prog.type) console.log(`   Type: ${prog.type}`);
    if (prog.earningRate) console.log(`   Earning Rate: ${prog.earningRate}`);
    if (prog.features) console.log(`   Features: ${prog.features.join(', ')}`);
    
    if (prog.onChain) {
      if (prog.onChain.exists) {
        console.log(`   ✅ Status: ACTIVE`);
        console.log(`      Owner: ${prog.onChain.owner.slice(0, 16)}...`);
        console.log(`      Executable: ${prog.onChain.executable}`);
        console.log(`      Size: ${(prog.onChain.dataSize / 1024).toFixed(2)} KB`);
        console.log(`      Rent Exempt: ${prog.onChain.lamports / 1e9} SOL`);
      } else {
        console.log(`   ❌ Status: NOT FOUND ON-CHAIN`);
      }
    }

    if (prog.references) {
      console.log(`   References: ${prog.references} mentions in codebase`);
    }

    if (prog.source) {
      console.log(`   Source: ${prog.source}`);
    }
  });

  // 6. Summary
  console.log('\n\n' + '═'.repeat(65));
  console.log('📈 SUMMARY');
  console.log('═'.repeat(65));
  console.log(`Total Programs: ${totalPrograms}`);
  console.log(`Active (On-Chain): ${activeCount}`);
  console.log(`Inactive/Unknown: ${totalPrograms - activeCount}`);

  const deploymentCount = Object.keys(deploymentPrograms).length;
  const codebaseCount = Object.keys(allPrograms).length - deploymentCount;

  console.log(`\nBreakdown:`);
  console.log(`  • From Deployment Data: ${deploymentCount}`);
  console.log(`  • From Codebase Scan: ${codebaseCount}`);

  // 7. Save report
  const report = {
    timestamp: new Date().toISOString(),
    network: 'solana-mainnet',
    totalPrograms,
    activePrograms: activeCount,
    inactivePrograms: totalPrograms - activeCount,
    programs: programDetails,
    summary: {
      fromDeployment: deploymentCount,
      fromCodebase: codebaseCount
    }
  };

  fs.writeFileSync(
    '.cache/program-scan-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log(`\n✅ Full report saved: .cache/program-scan-report.json`);

  // 8. Create summary table
  console.log('\n\n📋 PROGRAM MATRIX');
  console.log('─'.repeat(65));

  const matrix = [];
  Object.entries(programDetails).forEach(([addr, prog]) => {
    if (prog.address) {
      matrix.push({
        Name: prog.name || 'Unknown',
        Address: prog.address.slice(0, 16) + '...',
        Status: prog.onChain?.exists ? '✅ ACTIVE' : '❌ INACTIVE',
        Type: prog.type || prog.symbol || '-',
        Authority: prog.authority ? prog.authority.slice(0, 12) + '...' : '-'
      });
    }
  });

  console.table(matrix);

  console.log('\n');
}

main().catch(console.error);
