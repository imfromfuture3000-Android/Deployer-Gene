const { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const RELAYER_URL = process.env.RELAYER_URL || 'https://mainnet.helius-rpc.com';

async function transferToBackpack() {
  console.log('💸 Transfer SOL: Backfill → Backpack (via Relayer)\n');

  const connection = new Connection(RPC_URL, 'confirmed');

  // Load deployer keypair (signer)
  const deployerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('.cache/user_auth.json', 'utf-8')))
  );

  const backfill = new PublicKey('8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y');
  const backpack = new PublicKey('ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6');
  const deployer = deployerKeypair.publicKey;

  console.log('📍 Addresses:');
  console.log(`   From (Backfill): ${backfill.toBase58()}`);
  console.log(`   To (Backpack): ${backpack.toBase58()}`);
  console.log(`   Signer (Deployer): ${deployer.toBase58()}\n`);

  // Get backfill balance
  const balance = await connection.getBalance(backfill);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  
  console.log(`💰 Backfill Balance: ${balanceSOL} SOL`);

  // Transfer amount (leave 0.001 SOL for rent)
  const rentExempt = 0.001 * LAMPORTS_PER_SOL;
  const transferAmount = balance - rentExempt;
  const transferSOL = transferAmount / LAMPORTS_PER_SOL;

  console.log(`📤 Transfer Amount: ${transferSOL} SOL`);
  console.log(`🔒 Rent Reserve: 0.001 SOL\n`);

  // Create transfer transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: backfill,
      toPubkey: backpack,
      lamports: transferAmount
    })
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = deployer; // Relayer will pay

  // Sign with deployer (as authority)
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
      throw new Error(`Relayer: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const signature = result.signature || result;

    console.log('✅ TRANSFER SUCCESSFUL!\n');
    console.log('📋 Transaction:');
    console.log(`   Signature: ${signature}`);
    console.log(`   Amount: ${transferSOL} SOL`);
    console.log(`   From: ${backfill.toBase58()}`);
    console.log(`   To: ${backpack.toBase58()}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${signature}`);

    // Log transfer
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'sol-transfer-backfill-to-backpack',
      signature,
      details: {
        from: backfill.toBase58(),
        to: backpack.toBase58(),
        amount: transferSOL,
        signer: deployer.toBase58()
      }
    };

    let deploymentLog = [];
    if (fs.existsSync('.cache/deployment-log.json')) {
      deploymentLog = JSON.parse(fs.readFileSync('.cache/deployment-log.json', 'utf-8'));
    }
    deploymentLog.push(logEntry);
    fs.writeFileSync('.cache/deployment-log.json', JSON.stringify(deploymentLog, null, 2));

    console.log('\n💾 Logged to: .cache/deployment-log.json');

  } catch (error) {
    console.error('❌ Transfer failed:', error.message);
    console.log('\n⚠️  Note: Backfill address requires private key to sign transfers');
    console.log('   Current setup: Deployer signs, but backfill owns the SOL');
    console.log('   Solution: Need backfill private key OR transfer authority first');
  }
}

transferToBackpack().catch(console.error);
