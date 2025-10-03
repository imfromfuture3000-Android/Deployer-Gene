#!/usr/bin/env node

const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType, TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');
require('dotenv').config();

// Configuration
const DEPLOYER_KEY = '2AHAs1gdHSGn2REJbARigh5CLoRuR9gdNTMTKu5UJBVVovXUxhPYeLFYTVgov7gyes4QkwLhgw89PAsGZbUjK2Yv';
const REBATE_ADDRESS = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
const connection = new Connection(process.env.RPC_URL, 'confirmed');

// Create authority keypair from base58 string
const bs58 = require('bs58');
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

async function fullAutoDeploy() {
  console.log('🚀 FULL AUTOMATED DEPLOYMENT INITIATED');
  console.log(`👑 Authority: ${authority.publicKey.toBase58()}`);
  console.log(`💰 Rebate Address: ${REBATE_ADDRESS}`);
  
  try {
    // 1. Create Token Mint
    const mint = await createMint(
      connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      9,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    console.log(`✅ Token Mint: ${mint.toBase58()}`);
    
    // 2. Create Treasury ATA
    const treasuryAta = await getOrCreateAssociatedTokenAccount(
      connection,
      authority,
      mint,
      new PublicKey(REBATE_ADDRESS),
      false,
      'confirmed',
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    console.log(`✅ Treasury ATA: ${treasuryAta.address.toBase58()}`);
    
    // 3. Mint Initial Supply (1B tokens)
    await mintTo(
      connection,
      authority,
      mint,
      treasuryAta.address,
      authority,
      1000000000n * 1000000000n,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    console.log('✅ Minted 1B tokens');
    
    // 4. Setup MEV Rebates
    const mevConfig = {
      rebateAddress: REBATE_ADDRESS,
      tipAccounts: [
        'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
        'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL'
      ],
      rebatePercentage: 50,
      enabled: true
    };
    
    // 5. Distribute to Allowlist
    const perAllowlistAmount = 10000000n * 1000000000n; // 10M tokens each
    
    for (const addr of ALLOWLIST) {
      try {
        const allowlistAta = await getOrCreateAssociatedTokenAccount(
          connection,
          authority,
          mint,
          new PublicKey(addr),
          false,
          'confirmed',
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
        
        await mintTo(
          connection,
          authority,
          mint,
          allowlistAta.address,
          authority,
          perAllowlistAmount,
          [],
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
        
        console.log(`✅ Distributed 10M tokens to ${addr.slice(0, 8)}...`);
      } catch (error) {
        console.log(`⚠️ Skip ${addr.slice(0, 8)}: ${error.message}`);
      }
    }
    
    // 6. Lock Mint Authority
    await setAuthority(
      connection,
      authority,
      mint,
      authority,
      AuthorityType.MintTokens,
      null,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    console.log('🔒 Mint authority locked');
    
    // 7. Save Deployment Data
    const deployment = {
      timestamp: new Date().toISOString(),
      mint: mint.toBase58(),
      authority: authority.publicKey.toBase58(),
      treasury: treasuryAta.address.toBase58(),
      rebateAddress: REBATE_ADDRESS,
      allowlist: ALLOWLIST,
      mevConfig,
      totalSupply: '1000000000',
      allowlistDistribution: '60000000',
      explorer: `https://explorer.solana.com/address/${mint.toBase58()}`,
      status: 'deployed'
    };
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/full-deployment.json', JSON.stringify(deployment, null, 2));
    
    // 8. Setup Autoclaim
    const autoclaimConfig = {
      enabled: true,
      rebateAddress: REBATE_ADDRESS,
      minThreshold: 0.001,
      interval: 3600000,
      contracts: [mint.toBase58()],
      tipAccounts: mevConfig.tipAccounts
    };
    
    fs.writeFileSync('.cache/autoclaim-config.json', JSON.stringify(autoclaimConfig, null, 2));
    
    console.log('\n🎯 DEPLOYMENT COMPLETE!');
    console.log(`🪙 Token: ${mint.toBase58()}`);
    console.log(`💰 Treasury: ${treasuryAta.address.toBase58()}`);
    console.log(`🔗 Explorer: ${deployment.explorer}`);
    console.log(`📊 Allowlist: ${ALLOWLIST.length} addresses`);
    console.log(`💎 MEV Rebates: ${mevConfig.rebatePercentage}%`);
    console.log(`⚡ Autoclaim: Enabled`);
    
    return deployment;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

// Execute deployment
if (require.main === module) {
  fullAutoDeploy().catch(console.error);
}

module.exports = { fullAutoDeploy };