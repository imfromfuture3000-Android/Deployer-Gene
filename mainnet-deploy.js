require('ts-node/register/transpile-only');
const web3 = require('@solana/web3.js');
const spl = require('@solana/spl-token');
const { loadHeliusConfig } = require('./src/helius/config');
const { createHeliusMpcClient } = require('./src/helius/mpcClient');

async function deployMainnet() {
  console.log('🚀 OMEGA PRIME MAINNET DEPLOYMENT');

  const heliusConfig = loadHeliusConfig();
  const mpcClient = createHeliusMpcClient(heliusConfig);
  const { connection } = mpcClient;

  const mint = web3.Keypair.generate();
  const payer = web3.Keypair.fromSecretKey(
    new Uint8Array([/* INSERT YOUR MAINNET KEYPAIR HERE */])
  );

  console.log('Mint:', mint.publicKey.toBase58());
  console.log('Payer:', payer.publicKey.toBase58());
  console.log('RPC:', heliusConfig.rpcUrl);
  console.log('Relayer Pubkey:', heliusConfig.relayerPubkeyString);

  const balance = await connection.getBalance(payer.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL');
  if (balance < 0.01 * 1e9) {
    console.error('❌ Insufficient SOL for mainnet deployment. Need at least 0.01 SOL');
    return;
  }

  const rent = await spl.getMinimumBalanceForRentExemptMint(connection);
  console.log('Rent required:', rent / 1e9, 'SOL');

  let priorityFeeMicrolamports = heliusConfig.priorityFeeMicroLamports;
  try {
    const priority = await mpcClient.getPriorityFees([payer.publicKey.toBase58()]);
    priorityFeeMicrolamports =
      priority.priorityFeeEstimate ||
      priority.priorityFeeLevels?.medium ||
      heliusConfig.priorityFeeMicroLamports;
    console.log('✅ Pulled priority fee recommendation for mint initialization');
  } catch (error) {
    console.log(
      `⚠️ Priority lookup failed, using configured defaults. Reason: ${error.message}`
    );
  }

  const tx = new web3.Transaction().add(
    web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: heliusConfig.computeUnitLimit
    }),
    web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFeeMicrolamports
    }),
    web3.SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: spl.MINT_SIZE,
      lamports: rent,
      programId: spl.TOKEN_2022_PROGRAM_ID
    }),
    spl.createInitializeMintInstruction(
      mint.publicKey,
      9,
      payer.publicKey,
      payer.publicKey,
      spl.TOKEN_2022_PROGRAM_ID
    )
  );

  let signature;
  try {
    tx.partialSign(payer, mint);
    signature = await mpcClient.submitTransaction(tx);
    console.log('✅ Submitted via Helius MPC relay');
  } catch (error) {
    console.log(
      `⚠️ MPC submission failed, falling back to standard send. Reason: ${error.message}`
    );
    signature = await web3.sendAndConfirmTransaction(connection, tx, [payer, mint]);
  }

  console.log('🎉 OMEGA PRIME DEPLOYED ON MAINNET!');
  console.log('Mint:', mint.publicKey.toBase58());
  console.log('Transaction:', signature);
  console.log('Explorer: https://explorer.solana.com/tx/' + signature);
}

deployMainnet().catch(console.error);
