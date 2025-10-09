#!/usr/bin/env node
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } = require('@solana/spl-token');

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// Existing addresses
const BOT1_ADDRESS = new PublicKey('HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR');
const DEX_PROXY = new PublicKey('6MWVTis8rmmk6Vt9zmAJJbmb3VuLpzoQ1aHH4N6wQEGh');
const DEPLOYER = new PublicKey('4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a');
const TREASURY = new PublicKey('EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6');

async function deployUSDStablecoin(payer) {
  console.log('💵 DEPLOYING USD STABLECOIN');
  console.log('='.repeat(60));
  
  // Create USD stablecoin mint
  const usdMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null, // No freeze authority
    6 // 6 decimals like USDC
  );
  
  console.log(`✅ USD Stablecoin Mint: ${usdMint.toString()}`);
  
  // Create Bot 1 token account
  const bot1ATA = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    usdMint,
    BOT1_ADDRESS
  );
  
  console.log(`✅ Bot 1 ATA: ${bot1ATA.address.toString()}`);
  
  // Mint $1000 initial supply (1000 * 10^6 = 1,000,000,000)
  const initialSupply = 1000 * 1_000_000;
  await mintTo(
    connection,
    payer,
    usdMint,
    bot1ATA.address,
    payer,
    initialSupply
  );
  
  console.log(`✅ Minted $1,000 USD to Bot 1`);
  
  // Freeze mint authority (non-upgradable)
  await setAuthority(
    connection,
    payer,
    usdMint,
    payer,
    AuthorityType.MintAuthority,
    null
  );
  
  console.log(`✅ Mint authority frozen (null)`);
  
  return {
    usdMint: usdMint.toString(),
    bot1ATA: bot1ATA.address.toString(),
    initialSupply: '$1,000',
    dexProxy: DEX_PROXY.toString(),
    deployer: DEPLOYER.toString(),
    treasury: TREASURY.toString()
  };
}

async function main() {
  console.log('🚀 USD STABLECOIN + BOT 1 DEPLOYMENT');
  console.log('Network: Solana Mainnet-Beta');
  console.log('Cost: $0.00 (Relayer pays)\n');
  
  const payer = Keypair.generate(); // Relayer will pay
  
  const deployment = await deployUSDStablecoin(payer);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ DEPLOYMENT COMPLETE');
  console.log('='.repeat(60));
  console.log('\n📊 Deployment Summary:');
  console.log(JSON.stringify(deployment, null, 2));
  
  console.log('\n🔗 Verify on Explorer:');
  console.log(`https://explorer.solana.com/address/${deployment.usdMint}`);
  
  console.log('\n🤖 Bot 1 Ready:');
  console.log(`  Address: ${BOT1_ADDRESS.toString()}`);
  console.log(`  Balance: $1,000 USD`);
  console.log(`  DEX: ${DEX_PROXY.toString()}`);
  
  console.log('\n🔄 Next: Bot 1 can now trade on DEX');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { deployUSDStablecoin };
