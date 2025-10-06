#!/usr/bin/env node

/**
 * 🔍 MAINNET METADATA CHECKER - Real data only
 */

const { Connection, PublicKey } = require('@solana/web3.js');
const { getAccount, getMint } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

async function checkMainnetMetadata() {
  console.log('🔍 MAINNET METADATA CHECKER');
  console.log('='.repeat(60));
  console.log('⚠️  MAINNET ONLY - NO DEVNET');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Validate mainnet genesis
  const genesisHash = await connection.getGenesisHash();
  const MAINNET_GENESIS = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
  
  if (genesisHash !== MAINNET_GENESIS) {
    console.log('❌ Not connected to mainnet!');
    console.log(`   Current: ${genesisHash}`);
    console.log(`   Expected: ${MAINNET_GENESIS}`);
    process.exit(1);
  }
  
  console.log('✅ Mainnet connection validated');
  
  // Check prepared mint
  const mintCache = JSON.parse(fs.readFileSync('.cache/mint.json', 'utf-8'));
  const mintAddress = mintCache.mint;
  
  console.log(`\n📍 Checking mint: ${mintAddress}`);
  
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const mintInfo = await getMint(connection, mintPubkey);
    
    console.log('\n✅ MINT EXISTS ON MAINNET');
    console.log(`   Address: ${mintAddress}`);
    console.log(`   Decimals: ${mintInfo.decimals}`);
    console.log(`   Supply: ${mintInfo.supply.toString()}`);
    console.log(`   Mint Authority: ${mintInfo.mintAuthority?.toBase58() || 'None'}`);
    console.log(`   Freeze Authority: ${mintInfo.freezeAuthority?.toBase58() || 'None'}`);
    
    // Check metadata account
    const metadataPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
        mintPubkey.toBuffer()
      ],
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    )[0];
    
    console.log(`\n🎭 Checking metadata: ${metadataPDA.toBase58()}`);
    
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    
    if (metadataAccount) {
      console.log('✅ METADATA EXISTS');
      console.log(`   Data length: ${metadataAccount.data.length} bytes`);
      console.log(`   Owner: ${metadataAccount.owner.toBase58()}`);
      
      // Parse metadata (simplified)
      const data = metadataAccount.data;
      if (data.length > 100) {
        const nameStart = 65;
        const nameLength = data.readUInt32LE(nameStart);
        const name = data.slice(nameStart + 4, nameStart + 4 + nameLength).toString('utf8').replace(/\0/g, '');
        
        const symbolStart = nameStart + 4 + nameLength + 4;
        const symbolLength = data.readUInt32LE(symbolStart - 4);
        const symbol = data.slice(symbolStart, symbolStart + symbolLength).toString('utf8').replace(/\0/g, '');
        
        console.log(`   Name: "${name}"`);
        console.log(`   Symbol: "${symbol}"`);
      }
    } else {
      console.log('❌ NO METADATA FOUND');
      console.log('💡 Run: npm run mainnet:set-metadata');
    }
    
    // Check treasury token account
    const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY || 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
    const treasuryATA = PublicKey.findProgramAddressSync(
      [
        treasuryPubkey.toBuffer(),
        new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb').toBuffer(),
        mintPubkey.toBuffer()
      ],
      new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    )[0];
    
    console.log(`\n💰 Checking treasury ATA: ${treasuryATA.toBase58()}`);
    
    try {
      const tokenAccount = await getAccount(connection, treasuryATA);
      console.log('✅ TREASURY TOKEN ACCOUNT EXISTS');
      console.log(`   Balance: ${tokenAccount.amount.toString()} tokens`);
      console.log(`   Owner: ${tokenAccount.owner.toBase58()}`);
    } catch (e) {
      console.log('❌ Treasury token account not found');
      console.log('💡 Run: npm run mainnet:mint-initial');
    }
    
  } catch (error) {
    if (error.message.includes('could not find account')) {
      console.log('❌ MINT NOT DEPLOYED TO MAINNET');
      console.log('💡 This mint is only prepared, not deployed');
      console.log('🚀 Deploy with: npm run aws:mainnet-deploy');
    } else {
      console.error('❌ Error checking mint:', error.message);
    }
  }
  
  console.log('\n📊 MAINNET STATUS SUMMARY:');
  console.log(`   Mint Address: ${mintAddress}`);
  console.log(`   Network: Mainnet-beta`);
  console.log(`   Status: ${mintCache.status || 'Unknown'}`);
  console.log(`   Explorer: https://explorer.solana.com/address/${mintAddress}`);
}

checkMainnetMetadata().catch(e => {
  console.error('❌ Metadata check failed:', e.message);
  process.exit(1);
});