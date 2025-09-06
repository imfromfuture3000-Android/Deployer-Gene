// EXECUTE  INVESTMENT - MINT TOKENS TO ALL BOTS
const web3 = require('@solana/web3.js');
const spl = require('@solana/spl-token');

async function executeBotMinting() {
  console.log('?? EXECUTING  INVESTMENT - BOT TOKEN DISTRIBUTION');
  console.log('='.repeat(60));
  
  const connection = new web3.Connection('https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5');
  
  // REPLACE WITH YOUR FUNDED KEYPAIR (needs 0.019 SOL)
  const payer = web3.Keypair.generate();
  const mint = web3.Keypair.generate();
  
  const BOTS = [
    { name: 'STAKE_MASTER', address: 'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR' },
    { name: 'MINT_OPERATOR', address: 'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d' },
    { name: 'CONTRACT_DEPLOYER', address: 'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA' },
    { name: 'MEV_HUNTER', address: '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41' },
    { name: 'LOOT_EXTRACTOR', address: '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw' }
  ];
  
  const TOKENS_PER_BOT = 100000 * Math.pow(10, 9); // 100,000 tokens with 9 decimals
  
  console.log('?? INVESTMENT: .00');
  console.log('?? SLP Token Mint:', mint.publicKey.toBase58());
  console.log('?? Payer Address:', payer.publicKey.toBase58());
  console.log('?? Target Bots:', BOTS.length);
  console.log('?? Tokens per Bot: 100,000 SLP');
  console.log('?? Total Distribution: 500,000 SLP');
  
  try {
    // STEP 1: Create Mint Account
    console.log('\\n? STEP 1: Creating SLP Token Mint...');
    const mintRent = await spl.getMinimumBalanceForRentExemptMint(connection);
    
    const createMintTx = new web3.Transaction().add(
      web3.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: spl.MINT_SIZE,
        lamports: mintRent,
        programId: spl.TOKEN_PROGRAM_ID,
      }),
      spl.createInitializeMintInstruction(
        mint.publicKey,
        9, // decimals
        payer.publicKey, // mint authority
        null // freeze authority
      )
    );
    
    console.log('? Mint transaction prepared');
    
    // STEP 2: Create Token Accounts and Mint to Each Bot
    console.log('\\n? STEP 2: Creating Token Accounts for Bots...');
    
    for (let i = 0; i < BOTS.length; i++) {
      const bot = BOTS[i];
      const botPubkey = new web3.PublicKey(bot.address);
      
      console.log('\\n?? Processing Bot' + (i+1) + ' - ' + bot.name);
      console.log('Address:', bot.address);
      
      // Create associated token account
      const associatedTokenAddress = await spl.getAssociatedTokenAddress(
        mint.publicKey,
        botPubkey
      );
      
      console.log('Token Account:', associatedTokenAddress.toBase58());
      
      const createTokenAccountTx = new web3.Transaction().add(
        spl.createAssociatedTokenAccountInstruction(
          payer.publicKey, // payer
          associatedTokenAddress, // associated token account
          botPubkey, // owner
          mint.publicKey // mint
        ),
        spl.createMintToInstruction(
          mint.publicKey, // mint
          associatedTokenAddress, // destination
          payer.publicKey, // authority
          TOKENS_PER_BOT // amount (100,000 with 9 decimals)
        )
      );
      
      console.log('? Bot' + (i+1) + ' will receive 100,000 SLP tokens');
    }
    
    console.log('\\n?? TRANSACTION SUMMARY:');
    console.log('1. Create SLP mint with 9 decimals');
    console.log('2. Create 5 token accounts (one per bot)');
    console.log('3. Mint 100,000 tokens to each bot');
    console.log('4. Total distribution: 500,000 SLP tokens');
    
    console.log('\\n?? COST ESTIMATE:');
    console.log('Mint account rent: 0.002 SOL');
    console.log('Token accounts: 0.010 SOL (5 accounts)');
    console.log('Transaction fees: 0.007 SOL');
    console.log('Total: 0.019 SOL (~.85)');
    console.log('Within  budget: ?');
    
    console.log('\\n?? BOT TOKEN DISTRIBUTION:');
    BOTS.forEach((bot, i) => {
      console.log('Bot' + (i+1) + ' (' + bot.name + '):');
      console.log('  Address: ' + bot.address);
      console.log('  Tokens: 100,000 SLP');
      console.log('  Purpose: Operational funding');
    });
    
    console.log('\\n?? TO EXECUTE:');
    console.log('1. Replace payer keypair with funded wallet (0.02 SOL needed)');
    console.log('2. Run the transaction');
    console.log('3. All 5 bots will receive 100,000 SLP tokens each');
    
    console.log('\\n? READY FOR DEPLOYMENT');
    console.log(' investment will fund all bot operations');
    
    return {
      mintAddress: mint.publicKey.toBase58(),
      payerAddress: payer.publicKey.toBase58(),
      botsToFund: BOTS.length,
      tokensPerBot: 100000,
      totalTokens: 500000,
      estimatedCostSOL: 0.019,
      estimatedCostUSD: 2.85
    };
    
  } catch (error) {
    console.error('? Error:', error.message);
    throw error;
  }
}

executeBotMinting().then(result => {
  console.log('\\n?? BOT FUNDING PLAN COMPLETE');
  console.log('Ready to distribute 500,000 SLP tokens to all bots');
  console.log('Investment:  | Cost: .85 | Profit: .15');
}).catch(console.error);
