const { Connection, PublicKey, Keypair, Transaction, SystemProgram, TransactionInstruction } = require('@solana/web3.js');
const fs = require('fs');

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const RELAYER_URL = process.env.RELAYER_URL || 'https://mainnet.helius-rpc.com';

async function announceOnChain() {
  console.log('🔗 On-Chain Authority Announcement\n');

  const connection = new Connection(RPC_URL, 'confirmed');
  
  // Load deployer keypair
  const deployerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('.cache/user_auth.json', 'utf-8')))
  );
  const deployer = deployerKeypair.publicKey;

  // Load announcement data
  const announcement = JSON.parse(fs.readFileSync('.cache/backfill-authority-announcement.json', 'utf-8'));
  const backfillAddress = new PublicKey(announcement.backfillAddress);

  console.log('📍 Deployer:', deployer.toBase58());
  console.log('🏦 Backfill:', backfillAddress.toBase58());

  // Verify on-chain state
  console.log('\n🔍 Verifying On-Chain State...\n');

  const [deployerInfo, backfillInfo] = await Promise.all([
    connection.getAccountInfo(deployer),
    connection.getAccountInfo(backfillAddress)
  ]);

  console.log('✅ Deployer Account:', deployerInfo ? 'EXISTS' : 'NOT FOUND');
  console.log('✅ Backfill Account:', backfillInfo ? 'EXISTS' : 'NOT FOUND');

  if (backfillInfo) {
    const balance = backfillInfo.lamports / 1e9;
    console.log(`💰 Backfill Balance: ${balance} SOL`);
  }

  // Create memo instruction for on-chain announcement
  const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  
  const announcementMemo = JSON.stringify({
    action: 'AUTHORITY_ANNOUNCEMENT',
    timestamp: new Date().toISOString(),
    authority: deployer.toBase58(),
    backfill: backfillAddress.toBase58(),
    assets: {
      sol: announcement.assets.sol,
      tokens: announcement.assets.tokenAccounts
    },
    status: 'CLAIMED'
  });

  console.log('\n📝 Creating On-Chain Announcement...\n');

  const transaction = new Transaction().add(
    new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(announcementMemo, 'utf-8')
    })
  );

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = deployer;

  // Sign transaction
  transaction.sign(deployerKeypair);

  // Serialize for relayer
  const serializedTx = transaction.serialize().toString('base64');
  const txSize = transaction.serialize().length;

  console.log('📦 Transaction Details:');
  console.log(`   Size: ${txSize} bytes`);
  console.log(`   Blockhash: ${blockhash.slice(0, 8)}...`);
  console.log(`   Fee Payer: ${deployer.toBase58()}`);

  // Send via relayer
  console.log('\n🚀 Sending via Relayer...\n');

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
      throw new Error(`Relayer error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const signature = result.signature || result;

    console.log('✅ ON-CHAIN ANNOUNCEMENT SUCCESSFUL!\n');
    console.log('📋 Transaction Details:');
    console.log(`   Signature: ${signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${signature}`);
    console.log(`   Authority: ${deployer.toBase58()}`);
    console.log(`   Backfill: ${backfillAddress.toBase58()}`);

    // Update announcement with on-chain signature
    announcement.onChainSignature = signature;
    announcement.onChainTimestamp = new Date().toISOString();
    announcement.explorerUrl = `https://explorer.solana.com/tx/${signature}`;
    
    fs.writeFileSync(
      '.cache/backfill-authority-announcement.json',
      JSON.stringify(announcement, null, 2)
    );

    // Log to deployment log
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'onchain-authority-announce',
      signature,
      details: {
        authority: deployer.toBase58(),
        backfill: backfillAddress.toBase58(),
        sol: announcement.assets.sol,
        tokens: announcement.assets.tokenAccounts
      }
    };

    let deploymentLog = [];
    if (fs.existsSync('.cache/deployment-log.json')) {
      deploymentLog = JSON.parse(fs.readFileSync('.cache/deployment-log.json', 'utf-8'));
    }
    deploymentLog.push(logEntry);
    fs.writeFileSync('.cache/deployment-log.json', JSON.stringify(deploymentLog, null, 2));

    console.log('\n🎯 Authority announcement is now VERIFIED ON-CHAIN!');
    console.log('💾 Updated: .cache/backfill-authority-announcement.json');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Fallback: try direct send
    console.log('\n🔄 Attempting direct send...');
    try {
      const signature = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        maxRetries: 3
      });
      
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      console.log('✅ Direct send successful!');
      console.log(`   Signature: ${signature}`);
      console.log(`   Explorer: https://explorer.solana.com/tx/${signature}`);
    } catch (directError) {
      console.error('❌ Direct send failed:', directError.message);
    }
  }
}

announceOnChain().catch(console.error);
