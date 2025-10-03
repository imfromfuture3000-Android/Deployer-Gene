#!/usr/bin/env node

const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
require('dotenv').config();

// Configuration
const DEPLOYER_KEY = '2AHAs1gdHSGn2REJbARigh5CLoRuR9gdNTMTKu5UJBVVovXUxhPYeLFYTVgov7gyes4QkwLhgw89PAsGZbUjK2Yv';
const REBATE_ADDRESS = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
const connection = new Connection(process.env.RPC_URL, 'confirmed');

// Create authority keypair
const authority = Keypair.fromSecretKey(bs58.decode(DEPLOYER_KEY));

// Allowlist addresses
const ALLOWLIST = [
  'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4',
  'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR',
  'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d',
  'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA',
  '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41',
  '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw'
];

async function simpleAutoDeploy() {
  console.log('🚀 SIMPLE AUTO DEPLOYMENT');
  console.log(`👑 Authority: ${authority.publicKey.toBase58()}`);
  console.log(`💰 Rebate Address: ${REBATE_ADDRESS}`);
  
  try {
    // 1. Create Token Mint
    const mint = await createMint(
      connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      9
    );
    console.log(`✅ Token Mint: ${mint.toBase58()}`);
    
    // 2. Create Treasury ATA
    const treasuryAta = await getOrCreateAssociatedTokenAccount(
      connection,
      authority,
      mint,
      new PublicKey(REBATE_ADDRESS)
    );
    console.log(`✅ Treasury ATA: ${treasuryAta.address.toBase58()}`);
    
    // 3. Mint Initial Supply (1B tokens)
    await mintTo(
      connection,
      authority,
      mint,
      treasuryAta.address,
      authority,
      1000000000n * 1000000000n
    );
    console.log('✅ Minted 1B tokens');
    
    // 4. Distribute to Allowlist (10M each)
    const perAllowlistAmount = 10000000n * 1000000000n;
    
    for (const addr of ALLOWLIST) {
      try {
        const allowlistAta = await getOrCreateAssociatedTokenAccount(
          connection,
          authority,
          mint,
          new PublicKey(addr)
        );
        
        await mintTo(
          connection,
          authority,
          mint,
          allowlistAta.address,
          authority,
          perAllowlistAmount
        );
        
        console.log(`✅ Distributed 10M tokens to ${addr.slice(0, 8)}...`);
      } catch (error) {
        console.log(`⚠️ Skip ${addr.slice(0, 8)}: ${error.message}`);
      }
    }
    
    // 5. Lock Mint Authority
    await setAuthority(
      connection,
      authority,
      mint,
      authority,
      AuthorityType.MintTokens,
      null
    );
    console.log('🔒 Mint authority locked');
    
    // 6. Save Deployment Data
    const deployment = {
      timestamp: new Date().toISOString(),
      mint: mint.toBase58(),
      authority: authority.publicKey.toBase58(),
      treasury: treasuryAta.address.toBase58(),
      rebateAddress: REBATE_ADDRESS,
      allowlist: ALLOWLIST,
      totalSupply: '1000000000',
      allowlistDistribution: '60000000',
      explorer: `https://explorer.solana.com/address/${mint.toBase58()}`,
      status: 'deployed'
    };
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/simple-deployment.json', JSON.stringify(deployment, null, 2));
    
    // 7. Setup MEV Rebates
    const mevConfig = {
      rebateAddress: REBATE_ADDRESS,
      tipAccounts: [
        'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
        'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL'
      ],
      rebatePercentage: 50,
      enabled: true
    };
    
    fs.writeFileSync('.cache/mev-config.json', JSON.stringify(mevConfig, null, 2));
    
    console.log('\n🎯 DEPLOYMENT COMPLETE!');
    console.log(`🪙 Token: ${mint.toBase58()}`);
    console.log(`💰 Treasury: ${treasuryAta.address.toBase58()}`);
    console.log(`🔗 Explorer: ${deployment.explorer}`);
    console.log(`📊 Allowlist: ${ALLOWLIST.length} addresses`);
    console.log(`💎 MEV Rebates: 50% enabled`);
    
    return deployment;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  simpleAutoDeploy().catch(console.error);
}

module.exports = { simpleAutoDeploy };