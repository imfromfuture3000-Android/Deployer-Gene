import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { createMint, getMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, TOKEN_2022_PROGRAM_ID, getTokenAccountBalance } from '@solana/spl-token';
import { createMetadataAccountV3, updateMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createInterface } from 'readline';

dotenv.config();

// Use environment variable for owner address instead of hardcoded value
const OWNER_ADDRESS = process.env.TREASURY_PUBKEY || process.env.OWNER_ADDRESS;
const rl = createInterface({ input: process.stdin, output: process.stdout });

async function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

const REQUIRED_FILES: { [key: string]: string } = {
  '.env.sample': `
RPC_URL=https://api.mainnet-beta.solana.com
RELAYER_URL=https://<your-relayer-domain>/relay/sendRawTransaction
RELAYER_PUBKEY=<RELAYER_FEE_PAYER_PUBKEY>
TREASURY_PUBKEY=<YOUR_TREASURY_PUBKEY>
DAO_PUBKEY=<YOUR_DAO_MULTISIG_PUBKEY> # Optional
AUTHORITY_MODE=null # Options: null, dao, treasury
DRY_RUN=false
RELAYER_API_KEY=<YOUR_API_KEY> # Optional
`,
  '.gitignore': `
.env
.cache/
node_modules/
`,
  'package.json': JSON.stringify({
    name: 'stunning-solana',
    version: '1.0.0',
    scripts: {
      'mainnet:copilot': 'ts-node grok-copilot.ts',
      'mainnet:all': 'ts-node grok-copilot.ts --all'
    },
    dependencies: {
      '@solana/web3.js': '^1.95.3',
      '@solana/spl-token': '^0.4.8',
      '@metaplex-foundation/mpl-token-metadata': '^3.2.1',
      'bs58': '^6.0.0',
      'dotenv': '^16.4.5'
    },
    devDependencies: {
      '@types/node': '^22.7.4',
      'ts-node': '^10.9.2',
      'typescript': '^5.6.2'
    }
  }, null, 2),
  'tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      strict: true,
      esModuleInterop: true,
      outDir: './dist',
      rootDir: '.'
    },
    include: ['grok-copilot.ts']
  }, null, 2),
  'README.md': `# Stunning Solana: Omega Prime Token Deployment

This repository deploys an SPL Token-2022 (ΩAGENT) on Solana mainnet-beta with zero SOL cost using a relayer. The \`grok-copilot.ts\` script handles all deployment steps interactively.

## Prerequisites
- Node.js >= 18
- npm >= 9
- A funded relayer (RELAYER_PUBKEY, RELAYER_URL)
- Treasury owner address: <YOUR_TREASURY_PUBKEY>
- Optional: DAO multisig public key (DAO_PUBKEY)
- Access to a Solana mainnet-beta RPC

## Setup
1. Clone the repo:
   \`\`\`bash
   git clone https://github.com/imfromfuture3000-Android/stunning-solana.git
   cd stunning-solana
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Copy \`.env.sample\` to \`.env\` and fill in:
   \`\`\`bash
   cp .env.sample .env
   \`\`\`
   Edit \`.env\`:
   \`\`\`
   RPC_URL=https://api.mainnet-beta.solana.com
   RELAYER_URL=https://<your-relayer-domain>/relay/sendRawTransaction
   RELAYER_PUBKEY=<RELAYER_FEE_PAYER_PUBKEY>
   TREASURY_PUBKEY=<YOUR_TREASURY_PUBKEY>
   DAO_PUBKEY=<YOUR_DAO_MULTISIG_PUBKEY> # Optional
   AUTHORITY_MODE=null # Options: null, dao, treasury
   DRY_RUN=false
   RELAYER_API_KEY=<YOUR_API_KEY> # Optional
   \`\`\`

## One-Command Deployment
\`\`\`bash
npm run mainnet:all
\`\`\`

## Copilot
Run the interactive Grok Copilot:
\`\`\`bash
npm run mainnet:copilot
\`\`\`

## Security Notes
- **No private keys** are stored in the repo.
- **Relayer pays fees**: All fees are covered by the relayer.
- **Authority lock**: Setting to \`null\` is **irreversible**.
- **Owner Address**: The treasury owner is configured via TREASURY_PUBKEY environment variable.

## Post-Deploy Checklist
1. Verify mint: \`https://explorer.solana.com/address/<MINT_ADDRESS>\`
2. Check treasury ATA: \`https://explorer.solana.com/address/<TREASURY_ATA>\`
3. Confirm metadata and authorities via Explorer.
`
};

// Utility Functions
function findMetadataPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(), mint.toBuffer()],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  )[0];
}

function findAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_2022_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  )[0];
}

function loadOrCreateUserAuth(): Keypair {
  const cacheDir = path.join(__dirname, '.cache');
  const keypairPath = path.join(cacheDir, 'user_auth.json');
  if (fs.existsSync(keypairPath)) {
    const keypairJson = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    return Keypair.fromSecretKey(Uint8Array.from(keypairJson));
  }
  const keypair = Keypair.generate();
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
  console.log(`Generated new USER_AUTH keypair: ${keypair.publicKey.toBase58()}`);
  return keypair;
}

async function sendViaRelayer(connection: Connection, relayerPubkey: string, relayerUrl: string, tx: Transaction, apiKey?: string): Promise<string> {
  const start = Date.now();
  tx.feePayer = new PublicKey(relayerPubkey);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;

  const b64 = tx.serialize({ requireAllSignatures: false }).toString('base64');
  if (process.env.DRY_RUN === 'true') {
    console.log(`[DRY_RUN] Transaction base64: ${b64.slice(0, 120)}...`);
    console.log(`[DRY_RUN] Transaction size: ${b64.length} bytes`);
    return 'DRY_RUN_SIGNATURE';
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(relayerUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ signedTransactionBase64: b64 }),
      });
      const j = await res.json();
      if (!j.success) throw new Error(j.error || `Relayer error (attempt ${attempt})`);
      await connection.confirmTransaction({ signature: j.txSignature, blockhash, lastValidBlockHeight }, 'confirmed');
      console.log(`Transaction confirmed: https://explorer.solana.com/tx/${j.txSignature} (${Date.now() - start}ms)`);
      return j.txSignature;
    } catch (e) {
      if (attempt === 3) throw new Error(`Relayer failed after 3 attempts: ${e.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Relayer unreachable');
}

async function createTokenMint(): Promise<PublicKey> {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const cacheDir = path.join(__dirname, '.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');

  if (fs.existsSync(mintCachePath)) {
    const mint = JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint;
    const mintInfo = await connection.getAccountInfo(new PublicKey(mint));
    if (mintInfo) {
      console.log(`Mint already exists: ${mint}`);
      return new PublicKey(mint);
    }
  }

  const mintKeypair = Keypair.generate();
  const tx = new Transaction().add(
    await createMint(
      connection,
      userAuth,
      userAuth.publicKey,
      userAuth.publicKey,
      9,
      mintKeypair,
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    )
  );

  tx.partialSign(userAuth, mintKeypair);
  const signature = await sendViaRelayer(connection, relayerPubkey, process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
  if (signature !== 'DRY_RUN_SIGNATURE') {
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(mintCachePath, JSON.stringify({ mint: mintKeypair.publicKey.toBase58() }));
  }
  console.log(`Created mint: ${mintKeypair.publicKey.toBase58()}`);
  return mintKeypair.publicKey;
}

async function mintInitialSupply(): Promise<void> {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);
  const mintCachePath = path.join(__dirname, '.cache/mint.json');

  if (!fs.existsSync(mintCachePath)) throw new Error('Mint not created. Run create mint first.');
  const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
  const treasuryAta = findAssociatedTokenAddress(treasuryPubkey, mint);

  const supply = BigInt(1000000000) * BigInt(10 ** 9);
  const ataInfo = await connection.getAccountInfo(treasuryAta);

  if (ataInfo) {
    const balance = await getTokenAccountBalance(treasuryAta);
    if (balance.value.amount === supply.toString()) {
      console.log(`Initial supply already minted to ${treasuryAta.toBase58()}`);
      return;
    }
  }

  const tx = new Transaction();
  if (!ataInfo) {
    tx.add(
      (await getOrCreateAssociatedTokenAccount(
        connection,
        userAuth,
        mint,
        treasuryPubkey,
        false,
        'confirmed',
        { commitment: 'confirmed' },
        TOKEN_2022_PROGRAM_ID
      )).instruction
    );
  }

  tx.add(
    await mintTo(
      connection,
      userAuth,
      mint,
      treasuryAta,
      userAuth.publicKey,
      supply,
      [],
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    )
  );

  tx.partialSign(userAuth);
  const signature = await sendViaRelayer(connection, relayerPubkey, process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
  console.log(`Minted ${supply} tokens to ${treasuryAta.toBase58()}`);
}

async function setTokenMetadata(): Promise<void> {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const mintCachePath = path.join(__dirname, '.cache/mint.json');
  const METADATA = {
    name: 'Omega Prime Token',
    symbol: 'ΩAGENT',
    description: 'Agent guild utility token powering Ω-Prime automations on Solana.',
    image: 'https://<hosted-image>/logo.png',
    external_url: 'https://<site>',
  };

  if (!fs.existsSync(mintCachePath)) throw new Error('Mint not created. Run create mint first.');
  const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
  const metadataPda = findMetadataPda(mint);

  const uri = `data:application/json;base64,${Buffer.from(JSON.stringify(METADATA)).toString('base64')}`;
  const tx = new Transaction();
  const metadataAccount = await connection.getAccountInfo(metadataPda);

  if (metadataAccount) {
    tx.add(
      updateMetadataAccountV3({
        metadata: metadataPda,
        updateAuthority: userAuth.publicKey,
        data: {
          name: METADATA.name,
          symbol: METADATA.symbol,
          uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
      })
    );
  } else {
    tx.add(
      createMetadataAccountV3({
        metadata: metadataPda,
        mint,
        mintAuthority: userAuth.publicKey,
        payer: userAuth.publicKey,
        updateAuthority: userAuth.publicKey,
        data: {
          name: METADATA.name,
          symbol: METADATA.symbol,
          uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
      })
    );
  }

  tx.partialSign(userAuth);
  const signature = await sendViaRelayer(connection, relayerPubkey, process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
  console.log(`Metadata set for mint ${mint.toBase58()}. URI: ${uri.slice(0, 50)}...`);
}

async function lockAuthorities(): Promise<void> {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);
  const daoPubkey = process.env.DAO_PUBKEY ? new PublicKey(process.env.DAO_PUBKEY) : null;
  const authorityMode = process.env.AUTHORITY_MODE || 'null';
  const mintCachePath = path.join(__dirname, '.cache/mint.json');

  if (!fs.existsSync(mintCachePath)) throw new Error('Mint not created. Run create mint first.');
  const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);

  const mintInfo = await connection.getAccountInfo(mint);
  if (!mintInfo) throw new Error('Mint not found.');

  const targetAuthority = authorityMode === 'dao' && daoPubkey ? daoPubkey : authorityMode === 'treasury' ? treasuryPubkey : null;
  const txs = [];
  const authorityTypes = ['MintTokens', 'FreezeAccount'];

  for (const authType of authorityTypes) {
    const currentAuthority = await connection.getTokenSupply(mint).then((info) => {
      return authType === 'MintTokens' ? info.value.mintAuthority : info.value.freezeAuthority;
    });

    if (currentAuthority && (!targetAuthority || !currentAuthority.equals(targetAuthority))) {
      txs.push(
        new Transaction().add(
          await setAuthority(
            connection,
            userAuth,
            mint,
            userAuth.publicKey,
            authType as any,
            targetAuthority,
            [],
            { commitment: 'confirmed' },
            TOKEN_2022_PROGRAM_ID
          )
        )
      );
    }
  }

  for (const tx of txs) {
    tx.partialSign(userAuth);
    const signature = await sendViaRelayer(connection, relayerPubkey, process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
    console.log(`Authority set: ${signature}`);
  }

  console.log(`Mint ${mint.toBase58()} authorities set to ${targetAuthority ? targetAuthority.toBase58() : 'null'}.`);
}

async function rollback(): Promise<void> {
  const cacheDir = path.join(__dirname, '.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');
  const userAuthPath = path.join(cacheDir, 'user_auth.json');

  if (fs.existsSync(mintCachePath)) {
    const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
    const connection = new Connection(process.env.RPC_URL!, 'confirmed');
    const metadataPda = findMetadataPda(mint);
    const mintInfo = await connection.getAccountInfo(mint);
    const metadataInfo = await connection.getAccountInfo(metadataPda);

    console.log(`Mint exists: ${mintInfo ? 'Yes' : 'No'}`);
    console.log(`Metadata exists: ${metadataInfo ? 'Yes' : 'No'}`);
    console.log('Note: On-chain data (mint, metadata) cannot be deleted. Delete cache to restart.');

    fs.unlinkSync(mintCachePath);
    console.log('Deleted mint cache.');
  }
  if (fs.existsSync(userAuthPath)) {
    fs.unlinkSync(userAuthPath);
    console.log('Deleted user auth cache.');
  }
  console.log('Rollback complete. Run `npm run mainnet:copilot` to restart deployment.');
}

async function checkAndCreateFiles(): Promise<boolean> {
  let allFilesPresent = true;
  const rootDir = __dirname;

  const checkAndCreate = (filePath: string, content: string) => {
    if (!fs.existsSync(filePath)) {
      console.log(`Creating missing file: ${filePath}`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, content);
      allFilesPresent = false;
    }
  };

  Object.entries(REQUIRED_FILES).forEach(([file, content]) => {
    checkAndCreate(path.join(rootDir, file), content);
  });

  if (!allFilesPresent) {
    console.log('Installing dependencies due to new package.json...');
    try {
      require('child_process').execSync('npm install', { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to install dependencies: ${e.message}`);
      return false;
    }
  }

  return allFilesPresent;
}

async function checkEnv(): Promise<boolean> {
  const required = ['RPC_URL', 'RELAYER_URL', 'RELAYER_PUBKEY', 'TREASURY_PUBKEY'];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing ${key} in .env`);
      return false;
    }
  }
  try {
    new PublicKey(process.env.RELAYER_PUBKEY!);
    const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);
    if (process.env.TREASURY_PUBKEY !== OWNER_ADDRESS) {
      console.error(`TREASURY_PUBKEY must be ${OWNER_ADDRESS}`);
      return false;
    }
    if (process.env.DAO_PUBKEY) new PublicKey(process.env.DAO_PUBKEY);
    console.log(`✅ Treasury owner confirmed: ${treasuryPubkey.toBase58()}`);
  } catch (e) {
    console.error('Invalid public key in .env');
    return false;
  }
  if (!['null', 'dao', 'treasury'].includes(process.env.AUTHORITY_MODE || '')) {
    console.error('Invalid AUTHORITY_MODE. Use: null, dao, or treasury');
    return false;
  }
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  try {
    await connection.getLatestBlockhash();
    console.log('✅ RPC connection successful');
    return true;
  } catch (e) {
    console.error(`Failed to connect to RPC: ${e.message}`);
    return false;
  }
}

async function checkDeploymentStatus(): Promise<void> {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const mintCachePath = path.join(__dirname, '.cache/mint.json');
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);

  console.log('\n📊 Deployment Status:');
  if (!fs.existsSync(mintCachePath)) {
    console.log('❌ Mint not created. Select "Create mint" to start.');
    return;
  }

  const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
  console.log(`✅ Mint Address: ${mint.toBase58()}`);
  console.log(`   Explorer: https://explorer.solana.com/address/${mint.toBase58()}`);

  try {
    const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    console.log(`✅ Mint Info: ${mintInfo.supply} tokens, Decimals: ${mintInfo.decimals}`);
    console.log(`   Mint Authority: ${mintInfo.mintAuthority ? mintInfo.mintAuthority.toBase58() : 'null'}`);
    console.log(`   Freeze Authority: ${mintInfo.freezeAuthority ? mintInfo.freezeAuthority.toBase58() : 'null'}`);

    const treasuryAta = findAssociatedTokenAddress(treasuryPubkey, mint);
    const ataBalance = await getTokenAccountBalance(connection, treasuryAta, 'confirmed');
    console.log(`✅ Treasury ATA: ${treasuryAta.toBase58()}`);
    console.log(`   Balance: ${ataBalance.value.uiAmountString} ΩAGENT`);

    const metadataPda = findMetadataPda(mint);
    const metadataInfo = await connection.getAccountInfo(metadataPda);
    console.log(`✅ Metadata: ${metadataInfo ? 'Set' : 'Not set'}`);
    if (metadataInfo) console.log(`   Metadata PDA: ${metadataPda.toBase58()}`);
  } catch (e) {
    console.error(`Error checking status: ${e.message}`);
  }
}

async function runAllSteps(): Promise<void> {
  console.log('Running full deployment...');
  await createTokenMint();
  await mintInitialSupply();
  await setTokenMetadata();
  await lockAuthorities();
}

async function confirmOwnerAddress(): Promise<boolean> {
  console.log(`\n📢 Owner Address Announcement:`);
  console.log(`The treasury owner for Omega Prime Token is set to: ${OWNER_ADDRESS}`);
  console.log(`This address will receive 1,000,000,000 ΩAGENT tokens.`);
  const confirm = await askQuestion('Confirm this is correct (yes/no): ');
  return confirm.toLowerCase() === 'yes';
}

async function grokCopilot() {
  console.log('🚀 Grok Copilot for Stunning Solana: Omega Prime Token Deployment');
  console.log('-------------------------------------------------------------');

  console.log('\n🔍 Checking for required files...');
  const allFilesPresent = await checkAndCreateFiles();
  if (!allFilesPresent) {
    console.log('✅ Created missing files. Please verify and commit changes before proceeding.');
    console.log('Run:');
    console.log('  git add .');
    console.log('  git commit -m "Add files for Omega Prime Token deployment"');
    console.log('  git push origin main');
    console.log('Then restart the copilot: npm run mainnet:copilot');
    rl.close();
    process.exit(0);
  }

  if (!(await confirmOwnerAddress())) {
    console.error('🛑 Owner address not confirmed. Please update TREASURY_PUBKEY in .env and try again.');
    rl.close();
    process.exit(1);
  }

  if (!(await checkEnv())) {
    console.error('🛑 Environment check failed. Please fix .env and try again.');
    rl.close();
    process.exit(1);
  }

  if (process.argv.includes('--all')) {
    await runAllSteps();
    await checkDeploymentStatus();
    rl.close();
    process.exit(0);
  }

  console.log('\n🔍 Checking deployment status...');
  await checkDeploymentStatus();

  while (true) {
    console.log('\n📋 Available Actions:');
    console.log('1. Run full deployment');
    console.log('2. Create mint');
    console.log('3. Mint initial supply');
    console.log('4. Set metadata');
    console.log('5. Lock authorities');
    console.log('6. Check deployment status');
    console.log('7. Run dry-run (all steps)');
    console.log('8. Rollback (delete cache)');
    console.log('9. Exit');

    const choice = await askQuestion('Select an action (1-9): ');

    switch (choice) {
      case '1':
        await runAllSteps();
        break;
      case '2':
        await createTokenMint();
        break;
      case '3':
        await mintInitialSupply();
        break;
      case '4':
        await setTokenMetadata();
        break;
      case '5':
        await lockAuthorities();
        break;
      case '6':
        await checkDeploymentStatus();
        break;
      case '7':
        console.log('Running dry-run...');
        process.env.DRY_RUN = 'true';
        await runAllSteps();
        break;
      case '8':
        await rollback();
        break;
      case '9':
        console.log('👋 Exiting Grok Copilot');
        rl.close();
        process.exit(0);
      default:
        console.log('❌ Invalid choice. Please select 1-9.');
    }
  }
}

grokCopilot().catch((e) => {
  console.error(`Grok Copilot failed: ${e.message}`);
  rl.close();
  process.exit(1);
});
