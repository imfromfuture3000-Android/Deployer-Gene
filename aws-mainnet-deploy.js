#!/usr/bin/env node

/**
 * 🚀 AWS MAINNET DEPLOYMENT - Real transactions only
 */

const { Connection, Keypair, Transaction, SystemProgram, PublicKey } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, MINT_SIZE } = require('@solana/spl-token');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// AWS Configuration
const s3 = new AWS.S3({ region: 'us-east-1' });
const lambda = new AWS.Lambda({ region: 'us-east-1' });
const ec2 = new AWS.EC2({ region: 'us-east-1' });

async function deployToAWSMainnet() {
  console.log('🚀 AWS MAINNET DEPLOYMENT - PRODUCTION ONLY');
  console.log('='.repeat(60));
  console.log('⚠️  NO TESTNET - REAL TRANSACTIONS ONLY');
  
  // Mainnet RPC endpoints
  const MAINNET_RPCS = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://rpc.ankr.com/solana'
  ];
  
  let connection;
  for (const rpc of MAINNET_RPCS) {
    try {
      connection = new Connection(rpc, 'confirmed');
      const version = await connection.getVersion();
      console.log(`✅ Connected to mainnet: ${rpc}`);
      console.log(`   Version: ${version['solana-core']}`);
      break;
    } catch (e) {
      console.log(`❌ Failed: ${rpc}`);
    }
  }
  
  if (!connection) {
    throw new Error('No mainnet RPC available');
  }
  
  // Validate mainnet genesis
  const genesisHash = await connection.getGenesisHash();
  const MAINNET_GENESIS = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
  
  if (genesisHash !== MAINNET_GENESIS) {
    throw new Error(`Not mainnet! Genesis: ${genesisHash}`);
  }
  
  console.log('✅ Mainnet genesis validated');
  
  // Load AWS-stored keypairs
  const deployerKey = await loadFromS3('deployer-keypair.json');
  const mintKey = await loadFromS3('mint-keypair.json') || generateMintKeypair();
  
  const deployer = Keypair.fromSecretKey(Uint8Array.from(deployerKey));
  const mint = Keypair.fromSecretKey(Uint8Array.from(mintKey));
  
  console.log(`💰 Deployer: ${deployer.publicKey.toBase58()}`);
  console.log(`📍 Mint: ${mint.publicKey.toBase58()}`);
  
  // Check real balance
  const balance = await connection.getBalance(deployer.publicKey);
  console.log(`💵 Balance: ${balance / 1e9} SOL`);
  
  if (balance < 0.01e9) {
    throw new Error('Insufficient SOL for mainnet deployment');
  }
  
  // Treasury from environment
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY || 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  
  // Build real transaction
  const rentExempt = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  const tx = new Transaction();
  
  // Create mint account
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: deployer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: rentExempt,
      programId: TOKEN_2022_PROGRAM_ID
    })
  );
  
  // Initialize mint
  tx.add(
    createInitializeMintInstruction(
      mint.publicKey,
      9,
      treasuryPubkey,
      treasuryPubkey,
      TOKEN_2022_PROGRAM_ID
    )
  );
  
  // Add priority fee for mainnet
  const priorityFee = await getPriorityFee(connection);
  tx.add({
    keys: [],
    programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
    data: Buffer.from([3, ...new Uint8Array(new BigUint64Array([BigInt(priorityFee)]).buffer)])
  });
  
  tx.feePayer = deployer.publicKey;
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  
  console.log('\n📝 Signing real mainnet transaction...');
  tx.sign(deployer, mint);
  
  console.log('📤 Submitting to mainnet...');
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    maxRetries: 3
  });
  
  console.log('⏳ Confirming on mainnet...');
  await connection.confirmTransaction(signature, 'confirmed');
  
  // Store results in AWS
  await storeInS3('mainnet-deployment.json', {
    mint: mint.publicKey.toBase58(),
    signature,
    timestamp: new Date().toISOString(),
    network: 'mainnet-beta',
    deployer: deployer.publicKey.toBase58(),
    treasury: treasuryPubkey.toBase58()
  });
  
  // Trigger AWS Lambda for post-deployment
  await triggerLambda('post-deployment-handler', {
    mint: mint.publicKey.toBase58(),
    signature
  });
  
  console.log('\n✅ MAINNET DEPLOYMENT SUCCESSFUL!');
  console.log('='.repeat(60));
  console.log(`📍 Mint: ${mint.publicKey.toBase58()}`);
  console.log(`📝 TX: ${signature}`);
  console.log(`🔗 Explorer: https://explorer.solana.com/tx/${signature}`);
  console.log(`💰 Cost: ${(rentExempt + priorityFee) / 1e9} SOL`);
  
  return {
    mint: mint.publicKey.toBase58(),
    signature,
    network: 'mainnet'
  };
}

async function loadFromS3(key) {
  try {
    const result = await s3.getObject({
      Bucket: 'omega-prime-deployer',
      Key: key
    }).promise();
    return JSON.parse(result.Body.toString());
  } catch (e) {
    return null;
  }
}

async function storeInS3(key, data) {
  await s3.putObject({
    Bucket: 'omega-prime-deployer',
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json'
  }).promise();
}

async function triggerLambda(functionName, payload) {
  try {
    await lambda.invoke({
      FunctionName: functionName,
      Payload: JSON.stringify(payload)
    }).promise();
  } catch (e) {
    console.warn('Lambda trigger failed:', e.message);
  }
}

function generateMintKeypair() {
  const keypair = Keypair.generate();
  const keyArray = Array.from(keypair.secretKey);
  
  // Store in S3 for persistence
  storeInS3('mint-keypair.json', keyArray);
  
  return keyArray;
}

async function getPriorityFee(connection) {
  try {
    const fees = await connection.getRecentPrioritizationFees();
    if (fees.length > 0) {
      const avg = fees.reduce((sum, fee) => sum + fee.prioritizationFee, 0) / fees.length;
      return Math.ceil(avg * 1.2);
    }
  } catch (e) {
    console.warn('Priority fee fetch failed');
  }
  return 5000;
}

// AWS Lambda handler
exports.handler = async (event) => {
  try {
    const result = await deployToAWSMainnet();
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Direct execution
if (require.main === module) {
  deployToAWSMainnet().catch(e => {
    console.error('❌ AWS Mainnet deployment failed:', e.message);
    process.exit(1);
  });
}