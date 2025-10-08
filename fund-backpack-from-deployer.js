const { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const RELAYER_URL = process.env.RELAYER_URL || 'https://mainnet.helius-rpc.com';

async function fundBackpack() {
  console.log('💸 Fund Backpack from Deployer (via Relayer)\n');

  const connection = new Connection(RPC_URL, 'confirmed');

  // Load deployer keypair
  const deployerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('.cache/user_auth.json', 'utf-8')))
  );

  const deployer = deployerKeypair.publicKey;
  const backpack = new PublicKey('ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6');

  console.log('📍 Addresses:');
  console.log(`   From (Deployer): ${deployer.toBase58()}`);
  console.log(`   To (Backpack): ${backpack.toBase58()}\n`);

  // Check deployer balance
  const balance = await connection.getBalance(deployer);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  
  console.log(`💰 Deployer Balance: ${balanceSOL} SOL`);

  if (balance === 0) {
    console.log('\n⚠️  Deployer has no SOL to transfer');
    console.log('💡 Solution: Fund deployer address first, then transfer to Backpack');
    console.log(`   Deployer: ${deployer.toBase58()}`);
    return;
  }

  // Transfer amount (leave 0.001 SOL for rent)
  const rentExempt = 0.001 * LAMPORTS_PER_SOL;
  const transferAmount = balance - rentExempt;
  const transferSOL = transferAmount / LAMPORTS_PER_SOL;

  console.log(`📤 Transfer Amount: ${transferSOL} SOL`);
  console.log(`🔒 Rent Reserve: 0.001 SOL\n`);

  // Create transfer transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: deployer,
      toPubkey: backpack,
      lamports: transferAmount
    })
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = deployer;

  // Sign transaction
  transaction.sign(deployerKeypair);

  const serializedTx = transaction.serialize().toString('base64');

  console.log('🚀 Sending via Relayer...\n');

  try {
    const response = await fetch(`${RELAYER_URL}/relay/sendRawTransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction: serializedTx,
        skipPreflight: false
      })
    });

    if (!response.ok) {
      throw new Error(`Relayer: ${response.status}`);
    }

    const result = await response.json();
    const signature = result.signature || result;

    console.log('✅ TRANSFER SUCCESSFUL!\n');
    console.log(`   Signature: ${signature}`);
    console.log(`   Amount: ${transferSOL} SOL`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${signature}`);

    // Log
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'fund-backpack-from-deployer',
      signature,
      details: { from: deployer.toBase58(), to: backpack.toBase58(), amount: transferSOL }
    };

    let log = fs.existsSync('.cache/deployment-log.json') 
      ? JSON.parse(fs.readFileSync('.cache/deployment-log.json', 'utf-8')) 
      : [];
    log.push(logEntry);
    fs.writeFileSync('.cache/deployment-log.json', JSON.stringify(log, null, 2));

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

fundBackpack().catch(console.error);
