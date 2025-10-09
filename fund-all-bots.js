#!/usr/bin/env node
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } = require('@solana/spl-token');

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

const BOTS = [
  { name: 'Bot 1 - Stake Master', address: 'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR', investment: 1000 },
  { name: 'Bot 2 - Mint Operator', address: 'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d', investment: 1500 },
  { name: 'Bot 3 - Contract Deployer', address: 'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA', investment: 2000 },
  { name: 'Bot 4 - MEV Hunter', address: '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41', investment: 2500 },
  { name: 'Bot 5 - Loot Extractor', address: '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw', investment: 3000 },
  { name: 'Bot 6 - Advanced', address: '8duk9DzqBVXmqiyci9PpBsKuRCwg6ytzWywjQztM6VzS', investment: 3500 },
  { name: 'Bot 7 - Elite', address: '96891wG6iLVEDibwjYv8xWFGFiEezFQkvdyTrM69ou24', investment: 4000 },
  { name: 'Bot 8 - Master', address: '2A8qGB3iZ21NxGjX4EjjWJKc9PFG1r7F4jkcR66dc4mb', investment: 5000 }
];

async function fundAllBots(payer) {
  console.log('💰 FUNDING ALL BOTS WITH INITIAL INVESTMENT');
  console.log('='.repeat(60));
  
  // Create USD stablecoin
  const usdMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    6
  );
  
  console.log(`✅ USD Mint: ${usdMint.toString()}\n`);
  
  const results = [];
  let totalInvestment = 0;
  
  for (const bot of BOTS) {
    const botPubkey = new PublicKey(bot.address);
    
    // Create token account
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      usdMint,
      botPubkey
    );
    
    // Mint investment amount
    const amount = bot.investment * 1_000_000;
    await mintTo(
      connection,
      payer,
      usdMint,
      ata.address,
      payer,
      amount
    );
    
    totalInvestment += bot.investment;
    
    console.log(`✅ ${bot.name}`);
    console.log(`   Address: ${bot.address}`);
    console.log(`   Investment: $${bot.investment}`);
    console.log(`   ATA: ${ata.address.toString()}\n`);
    
    results.push({
      ...bot,
      ata: ata.address.toString()
    });
  }
  
  // Freeze mint authority
  await setAuthority(
    connection,
    payer,
    usdMint,
    payer,
    AuthorityType.MintAuthority,
    null
  );
  
  console.log('='.repeat(60));
  console.log('✅ ALL BOTS FUNDED');
  console.log(`📊 Total Investment: $${totalInvestment}`);
  console.log(`🔒 Mint Authority: FROZEN (null)`);
  
  return {
    usdMint: usdMint.toString(),
    totalInvestment: `$${totalInvestment}`,
    bots: results
  };
}

async function main() {
  const payer = Keypair.generate(); // Relayer pays
  
  const deployment = await fundAllBots(payer);
  
  console.log('\n🔗 Verify USD Mint:');
  console.log(`https://explorer.solana.com/address/${deployment.usdMint}`);
  
  console.log('\n🤖 Bot Investment Summary:');
  deployment.bots.forEach((bot, i) => {
    console.log(`${i + 1}. ${bot.name}: $${bot.investment}`);
  });
  
  console.log('\n✅ All bots ready to trade on DEX');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fundAllBots };
