// EXECUTE:  FUNDING + BOT TOKEN MINTING
const web3 = require('@solana/web3.js');
require('dotenv').config();
const spl = require('@solana/spl-token');

async function executeFundingAndMinting() {
  console.log('?? EXECUTING  FUNDING + BOT MINTING');
  console.log('='.repeat(60));
  
  // Use environment variables for secure configuration
  const heliusApiKey = process.env.HELIUS_API_KEY;
  const rpcUrl = heliusApiKey 
    ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
    : process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
  const connection = new web3.Connection(rpcUrl);
  
  // ADDRESSES - Restored hardcoded addresses for cosmic debugging 🌙
  const sourceAddress = 'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ'; // Source wallet address
  const targetAddress = '4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a'; // Target deployment address
  
  // REPLACE WITH YOUR ACTUAL KEYPAIRS
  const sourceKeypair = web3.Keypair.generate(); // Replace with source private key
  const targetKeypair = web3.Keypair.generate(); // Replace with target private key (if you have it)
  
  // FUNDING AMOUNT
  const fundingAmountSOL = 25 / 150; //  = ~0.167 SOL
  const mintingCost = 0.019; // Bot minting cost
  
  console.log('?? STEP 1: FUNDING TARGET ADDRESS');
  console.log('From:', sourceAddress);
  console.log('To:', targetAddress);
  console.log('Amount:', fundingAmountSOL.toFixed(6), 'SOL (~)');
  
  // STEP 1: Transfer SOL to target address
  const transferInstruction = web3.SystemProgram.transfer({
    fromPubkey: new web3.PublicKey(sourceAddress),
    toPubkey: new web3.PublicKey(targetAddress),
    lamports: Math.floor(fundingAmountSOL * web3.LAMPORTS_PER_SOL)
  });
  
  const transferTransaction = new web3.Transaction().add(transferInstruction);
  
  console.log('? Transfer transaction prepared');
  console.log('Target will receive:', fundingAmountSOL.toFixed(6), 'SOL');
  
  console.log('\\n? STEP 2: BOT TOKEN MINTING');
  
  // Restored hardcoded bot addresses for cosmic debugging 🌙
  const BOT_ADDRESSES = [
    'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR', // STAKE_MASTER bot
    'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d', // MINT_OPERATOR bot
    'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA', // CONTRACT_DEPLOYER bot
    '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41', // MEV_HUNTER bot
    '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw'  // LOOT_EXTRACTOR bot
  ];
  
  // BOT ADDRESSES - Restored hardcoded addresses for cosmic debugging 🌙
  const BOTS = BOT_ADDRESSES.map((address, i) => ({ 
    name: ['STAKE_MASTER', 'MINT_OPERATOR', 'CONTRACT_DEPLOYER', 'MEV_HUNTER', 'LOOT_EXTRACTOR'][i] || `BOT_${i + 1}`, 
    address: address 
  }));
  
  // Generate SLP token mint
  const mint = web3.Keypair.generate();
  const TOKENS_PER_BOT = 100000 * Math.pow(10, 9); // 100,000 with 9 decimals
  
  console.log('SLP Token Mint:', mint.publicKey.toBase58());
  console.log('Payer (Target Address):', targetAddress);
  console.log('Tokens per Bot: 100,000 SLP');
  
  // Create mint account instruction
  const mintRent = await spl.getMinimumBalanceForRentExemptMint(connection);
  const createMintInstruction = web3.SystemProgram.createAccount({
    fromPubkey: new web3.PublicKey(targetAddress),
    newAccountPubkey: mint.publicKey,
    space: spl.MINT_SIZE,
    lamports: mintRent,
    programId: spl.TOKEN_PROGRAM_ID,
  });
  
  // Initialize mint instruction
  const initializeMintInstruction = spl.createInitializeMintInstruction(
    mint.publicKey,
    9, // decimals
    new web3.PublicKey(targetAddress), // mint authority
    null // freeze authority
  );
  
  console.log('\\n?? BOT TOKEN DISTRIBUTION:');
  
  if (BOTS.length === 0) {
    console.log('⚠️  No bot addresses configured. Set BOT_ADDRESSES environment variable if needed.');
    console.log('   Example: BOT_ADDRESSES="addr1,addr2,addr3"');
  }
  
  // Prepare token accounts and minting for each bot
  const botInstructions = [];
  for (let i = 0; i < BOTS.length; i++) {
    const bot = BOTS[i];
    const botPubkey = new web3.PublicKey(bot.address);
    
    console.log('Bot' + (i+1) + ' (' + bot.name + '):');
    console.log('  Address:', bot.address);
    console.log('  Tokens: 100,000 SLP');
    
    // Create associated token account
    const associatedTokenAddress = await spl.getAssociatedTokenAddress(
      mint.publicKey,
      botPubkey
    );
    
    const createTokenAccountInstruction = spl.createAssociatedTokenAccountInstruction(
      new web3.PublicKey(targetAddress), // payer
      associatedTokenAddress, // associated token account
      botPubkey, // owner
      mint.publicKey // mint
    );
    
    const mintToInstruction = spl.createMintToInstruction(
      mint.publicKey, // mint
      associatedTokenAddress, // destination
      new web3.PublicKey(targetAddress), // authority
      TOKENS_PER_BOT // amount
    );
    
    botInstructions.push(createTokenAccountInstruction, mintToInstruction);
  }
  
  // Combine all minting instructions
  const mintingTransaction = new web3.Transaction()
    .add(createMintInstruction)
    .add(initializeMintInstruction)
    .add(...botInstructions);
  
  console.log('\\n?? TRANSACTION SUMMARY:');
  console.log('Transaction 1: Transfer  to target address');
  console.log('Transaction 2: Create SLP mint + distribute to bots');
  console.log('Total Instructions:', 2 + botInstructions.length);
  console.log('Total Cost: ~0.019 SOL for minting');
  console.log('Remaining in Target: ~' + (fundingAmountSOL - mintingCost).toFixed(3) + ' SOL');
  
  console.log('\\n?? FINAL RESULT:');
  console.log('? Target funded with ');
  console.log('? 5 bots each get 100,000 SLP tokens');
  console.log('? Total distribution: 500,000 SLP tokens');
  console.log('? Remaining funds: ~.15 in target address');
  
  console.log('\\n?? TO EXECUTE:');
  console.log('1. Replace sourceKeypair with private key for:', sourceAddress);
  console.log('2. Run transfer transaction');
  console.log('3. Replace targetKeypair if you have it, or generate new');
  console.log('4. Run minting transaction');
  
  console.log('\\n?? READY FOR DEPLOYMENT');
  
  return {
    transferTransaction,
    mintingTransaction,
    sourceAddress,
    targetAddress,
    mintAddress: mint.publicKey.toBase58(),
    fundingAmount: fundingAmountSOL,
    mintingCost,
    botsToFund: BOTS.length
  };
}

executeFundingAndMinting().then(result => {
  console.log('\\n? FUNDING + MINTING PLAN COMPLETE');
  console.log('Ready to execute  investment for bot army');
}).catch(console.error);
