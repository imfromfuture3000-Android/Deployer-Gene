import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { TOKEN_2022_PROGRAM_ID, getMint, getTokenAccountBalance } from '@solana/spl-token';
import { findMetadataPda } from './utils/pdas';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

dotenv.config();

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

// Required files and their default content
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
    name: 'omega-prime-token',
    version: '1.2.0',
    scripts: {
      'dev:check': 'ts-node src/utils/checkEnv.ts',
      'mainnet:create-mint': 'ts-node src/createMint.ts',
      'mainnet:mint-initial': 'ts-node src/mintInitial.ts',
      'mainnet:set-metadata': 'ts-node src/setMetadata.ts',
      'mainnet:lock': 'ts-node src/lockAuthorities.ts',
      'mainnet:rollback': 'ts-node src/rollback.ts',
      'mainnet:copilot': 'ts-node src/grok-copilot.ts',
      'mainnet:all': 'npm run dev:check && npm run mainnet:create-mint && npm run mainnet:mint-initial && npm run mainnet:set-metadata && npm run mainnet:lock'
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
      rootDir: './src'
    },
    include: ['src/**/*']
  }, null, 2),
  'README.md': `# Omega Prime Token Deployment

This repository deploys an SPL Token-2022 on Solana mainnet-beta with zero SOL cost to the user, using a relayer fee-payer funded by sponsor credits. It creates a token mint, mints 1,000,000,000 ΩAGENT to a treasury, sets metadata, and sets authorities (null, DAO, or treasury).

## Prerequisites
- Node.js >= 18
- npm >= 9
- A funded relayer (RELAYER_PUBKEY, RELAYER_URL)
- A treasury public key (TREASURY_PUBKEY)
- Optional: DAO multisig public key (DAO_PUBKEY)
- Access to a Solana mainnet-beta RPC

## Setup
1. Clone the repo:
   \`\`\`bash
   git clone https://github.com/imfromfuture3000-Android/Omega-prime-deployer.git
   cd Omega-prime-deployer
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
Run all steps (idempotent):
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
- **Idempotency**: Scripts skip completed steps.

## Post-Deploy Checklist
1. Verify mint: \`https://explorer.solana.com/address/<MINT_ADDRESS>\`
2. Check treasury ATA: \`https://explorer.solana.com/address/<TREASURY_ATA>\`
3. Confirm metadata and authorities via Explorer.

## Disclaimer
All fees are covered by the relayer via sponsor credits.
`,
  'relayer-docs/README.md': `# Relayer Setup Guide

## Overview
The relayer receives base64-encoded, partially signed transactions via POST \`/relay/sendRawTransaction\`, signs them with its fee-payer keypair, and submits them to Solana mainnet-beta.

## Setup
1. **Dependencies**:
   \`\`\`bash
   npm init -y
   npm install express @solana/web3.js bs58 express-rate-limit
   \`\`\`
2. **Relayer Code** (\`relayer.js\`):
   \`\`\`javascript
   const express = require('express');
   const { Connection, Keypair, Transaction } = require('@solana/web3.js');
   const bs58 = require('bs58');
   const rateLimit = require('express-rate-limit');

   const app = express();
   app.use(express.json());

   const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
   const relayerKeypair = Keypair.fromSecretKey(bs58.decode(process.env.RELAYER_SECRET));
   const apiKey = process.env.RELAYER_API_KEY;
   const signatureCache = new Set();

   app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: { success: false, error: 'Rate limit exceeded' } }));

   app.post('/relay/sendRawTransaction', async (req, res) => {
     try {
       if (apiKey && req.headers.authorization !== \`Bearer \${apiKey}\`) return res.status(401).json({ success: false, error: 'Invalid API key' });
       const { signedTransactionBase64 } = req.body;
       if (!signedTransactionBase64) return res.status(400).json({ success: false, error: 'Missing transaction' });
       const tx = Transaction.from(Buffer.from(signedTransactionBase64, 'base64'));
       const signature = tx.signatures.find((sig) => sig.publicKey.equals(relayerKeypair.publicKey))?.signature;
       if (signature && signatureCache.has(signature.toString('base64'))) return res.status(400).json({ success: false, error: 'Duplicate transaction' });
       tx.partialSign(relayerKeypair);
       const txSignature = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true });
       await connection.confirmTransaction(txSignature, 'confirmed');
       signatureCache.add(txSignature);
       res.json({ success: true, txSignature });
     } catch (e) {
       res.status(500).json({ success: false, error: e.message });
     }
   });

   app.listen(3000, () => console.log('Relayer running on port 3000'));
   \`\`\`
3. **Environment**:
   - Set \`RELAYER_SECRET\` to the base58-encoded private key.
   - Set \`RELAYER_API_KEY\` for authentication.
   - Fund the relayer's public key with ~0.05 SOL.
`,
  'src/utils/relayer.ts': `import { Connection, PublicKey, Transaction } from '@solana/web3.js';

export async function sendViaRelayer(
  connection: Connection,
  relayerPubkey: string,
  relayerUrl: string,
  tx: Transaction,
  apiKey?: string
): Promise<string> {
  const start = Date.now();
  tx.feePayer = new PublicKey(relayerPubkey);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;

  const b64 = tx.serialize({ requireAllSignatures: false }).toString('base64');
  if (process.env.DRY_RUN === 'true') {
    console.log(\`[DRY_RUN] Transaction base64: \${b64.slice(0, 120)}...\`);
    console.log(\`[DRY_RUN] Transaction size: \${b64.length} bytes\`);
    return 'DRY_RUN_SIGNATURE';
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = \`Bearer \${apiKey}\`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(relayerUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ signedTransactionBase64: b64 }),
      });
      const j = await res.json();
      if (!j.success) throw new Error(j.error || \`Relayer error (attempt \${attempt})\`);
      await connection.confirmTransaction({ signature: j.txSignature, blockhash, lastValidBlockHeight }, 'confirmed');
      console.log(\`Transaction confirmed: https://explorer.solana.com/tx/\${j.txSignature} (\${Date.now() - start}ms)\`);
      return j.txSignature;
    } catch (e) {
      if (attempt === 3) throw new Error(\`Relayer failed after 3 attempts: \${e.message}\`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Relayer unreachable');
}
`,
  'src/utils/pdas.ts': `import { PublicKey } from '@solana/web3.js';

export function findMetadataPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(), mint.toBuffer()],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  )[0];
}

export function findAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(), mint.toBuffer()],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  )[0];
}
`,
  'src/utils/wallet.ts': `import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'fs';

export function loadOrCreateUserAuth(): Keypair {
  const cacheDir = path.join(__dirname, '../../.cache');
  const keypairPath = path.join(cacheDir, 'user_auth.json');
  if (fs.existsSync(keypairPath)) {
    const keypairJson = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    return Keypair.fromSecretKey(Uint8Array.from(keypairJson));
  }
  const keypair = Keypair.generate();
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
  console.log(\`Generated new USER_AUTH keypair: \${keypair.publicKey.toBase58()}\`);
  return keypair;
}
`,
  'src/utils/checkEnv.ts': `import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkEnv() {
  const required = ['RPC_URL', 'RELAYER_URL', 'RELAYER_PUBKEY', 'TREASURY_PUBKEY'];
  for (const key of required) {
    if (!process.env[key]) throw new Error(\`Missing \${key} in .env\`);
  }
  try {
    new PublicKey(process.env.RELAYER_PUBKEY!);
    new PublicKey(process.env.TREASURY_PUBKEY!);
    if (process.env.DAO_PUBKEY) new PublicKey(process.env.DAO_PUBKEY);
  } catch (e) {
    throw new Error('Invalid public key in .env');
  }
  if (!['null', 'dao', 'treasury'].includes(process.env.AUTHORITY_MODE || '')) {
    throw new Error('Invalid AUTHORITY_MODE. Use: null, dao, or treasury');
  }
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  try {
    await connection.getLatestBlockhash();
    console.log('RPC connection successful');
  } catch (e) {
    throw new Error(\`Failed to connect to RPC: \${e.message}\`);
  }
}

checkEnv().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
`,
  'src/createMint.ts': `import { Connection, Keypair, PublicKey, Transaction, TOKEN_2022_PROGRAM_ID } from '@solana/web3.js';
import { createMint } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendViaRelayer } from './utils/relayer';
import { loadOrCreateUserAuth } from './utils/wallet';

dotenv.config();

async function createTokenMint() {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const cacheDir = path.join(__dirname, '../.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');

  if (fs.existsSync(mintCachePath)) {
    const mint = JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint;
    const mintInfo = await connection.getAccountInfo(new PublicKey(mint));
    if (mintInfo) {
      console.log(\`Mint already exists: \${mint}\`);
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
  console.log(\`Created mint: \${mintKeypair.publicKey.toBase58()}\`);
  return mintKeypair.publicKey;
}

createTokenMint().catch((e) => {
  console.error(\`Mint creation failed: \${e.message}\`);
  process.exit(1);
});
`,
  'src/mintInitial.ts': `import { Connection, PublicKey, Keypair, Transaction, TOKEN_2022_PROGRAM_ID } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendViaRelayer } from './utils/relayer';
import { loadOrCreateUserAuth } from './utils/wallet';
import { findAssociatedTokenAddress } from './utils/pdas';

dotenv.config();

async function mintInitialSupply() {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);
  const mintCachePath = path.join(__dirname, '../.cache/mint.json');

  if (!fs.existsSync(mintCachePath)) throw new Error('Mint not created. Run createMint.ts first.');
  const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
  const treasuryAta = findAssociatedTokenAddress(treasuryPubkey, mint);

  const supply = BigInt(1000000000) * BigInt(10 ** 9);
  const ataInfo = await connection.getAccountInfo(treasuryAta);

  if (ataInfo) {
    const balance = await connection.getTokenAccountBalance(treasuryAta);
    if (balance.value.amount === supply.toString()) {
      console.log(\`Initial supply already minted to \${treasuryAta.toBase58()}\`);
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
  console.log(\`Minted \${supply} tokens to \${treasuryAta.toBase58()}\`);
}

mintInitialSupply().catch((e) => {
  console.error(\`Mint initial supply failed: \${e.message}\`);
  process.exit(1);
});
`,
  'src/setMetadata.ts': `import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { createMetadataAccountV3, updateMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendViaRelayer } from './utils/relayer';
import { loadOrCreateUserAuth } from './utils/wallet';
import { findMetadataPda } from './utils/pdas';

dotenv.config();

const METADATA = {
  name: 'Omega Prime Token',
  symbol: 'ΩAGENT',
  description: 'Agent guild utility token powering Ω-Prime automations on Solana.',
  image: 'https://<hosted-image>/logo.png',
  external_url: 'https://<site>',
};

async function setTokenMetadata() {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const mintCachePath = path.join(__dirname, '../.cache/mint.json');

  if (!fs.existsSync(mintCachePath)) throw new Error('Mint not created. Run createMint.ts first.');
  const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
  const metadataPda = findMetadataPda(mint);

  const uri = \`data:application/json;base64,\${Buffer.from(JSON.stringify(METADATA)).toString('base64')}\`;
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
  console.log(\`Metadata set for mint \${mint.toBase58()}. URI: \${uri.slice(0, 50)}...\`);
}

setTokenMetadata().catch((e) => {
  console.error(\`Metadata setting failed: \${e.message}\`);
  process.exit(1);
});
`,
  'src/lockAuthorities.ts': `import { Connection, PublicKey, Keypair, Transaction, TOKEN_2022_PROGRAM_ID } from '@solana/web3.js';
import { setAuthority } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendViaRelayer } from './utils/relayer';
import { loadOrCreateUserAuth } from './utils/wallet';

dotenv.config();

async function lockAuthorities() {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);
  const daoPubkey = process.env.DAO_PUBKEY ? new PublicKey(process.env.DAO_PUBKEY) : null;
  const authorityMode = process.env.AUTHORITY_MODE || 'null';
  const mintCachePath = path.join(__dirname, '../.cache/mint.json');

  if (!fs.existsSync(mintCachePath)) throw new Error('Mint not created. Run createMint.ts first.');
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
    console.log(\`Authority set: \${signature}\`);
  }

  console.log(\`Mint \${mint.toBase58()} authorities set to \${targetAuthority ? targetAuthority.toBase58() : 'null'}.\`);
}

lockAuthorities().catch((e) => {
  console.error(\`Lock authorities failed: \${e.message}\`);
  process.exit(1);
});
`,
  'src/rollback.ts': `import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { findMetadataPda } from './utils/pdas';

dotenv.config();

async function rollback() {
  const cacheDir = path.join(__dirname, '../.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');
  const userAuthPath = path.join(cacheDir, 'user_auth.json');

  if (fs.existsSync(mintCachePath)) {
    const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
    const connection = new Connection(process.env.RPC_URL!, 'confirmed');
    const metadataPda = findMetadataPda(mint);
    const mintInfo = await connection.getAccountInfo(mint);
    const metadataInfo = await connection.getAccountInfo(metadataPda);

    console.log(\`Mint exists: \${mintInfo ? 'Yes' : 'No'}\`);
    console.log(\`Metadata exists: \${metadataInfo ? 'Yes' : 'No'}\`);
    console.log('Note: On-chain data (mint, metadata) cannot be deleted. Delete cache to restart.');

    fs.unlinkSync(mintCachePath);
    console.log('Deleted mint cache.');
  }
  if (fs.existsSync(userAuthPath)) {
    fs.unlinkSync(userAuthPath);
    console.log('Deleted user auth cache.');
  }
  console.log('Rollback complete. Run \`npm run mainnet:all\` to restart deployment.');
}

rollback().catch((e) => {
  console.error(\`Rollback failed: \${e.message}\`);
  process.exit(1);
});
`
};

async function checkAndCreateFiles(): Promise<boolean> {
  let allFilesPresent = true;
  const srcDir = path.join(__dirname, '..');
  const rootDir = path.join(__dirname, '../..');
  const relayerDocsDir = path.join(rootDir, 'relayer-docs');
  const utilsDir = path.join(srcDir, 'utils');

  const checkAndCreate = (filePath: string, content: string) => {
    if (!fs.existsSync(filePath)) {
      console.log(`Creating missing file: ${filePath}`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, content);
      allFilesPresent = false;
    }
  };

  // Check and create root files
  checkAndCreate(path.join(rootDir, '.env.sample'), REQUIRED_FILES['.env.sample']);
  checkAndCreate(path.join(rootDir, '.gitignore'), REQUIRED_FILES['.gitignore']);
  checkAndCreate(path.join(rootDir, 'package.json'), REQUIRED_FILES['package.json']);
  checkAndCreate(path.join(rootDir, 'tsconfig.json'), REQUIRED_FILES['tsconfig.json']);
  checkAndCreate(path.join(rootDir, 'README.md'), REQUIRED_FILES['README.md']);
  checkAndCreate(path.join(relayerDocsDir, 'README.md'), REQUIRED_FILES['relayer-docs/README.md']);

  // Check and create src files
  checkAndCreate(path.join(srcDir, 'createMint.ts'), REQUIRED_FILES['src/createMint.ts']);
  checkAndCreate(path.join(srcDir, 'mintInitial.ts'), REQUIRED_FILES['src/mintInitial.ts']);
  checkAndCreate(path.join(srcDir, 'setMetadata.ts'), REQUIRED_FILES['src/setMetadata.ts']);
  checkAndCreate(path.join(srcDir, 'lockAuthorities.ts'), REQUIRED_FILES['src/lockAuthorities.ts']);
  checkAndCreate(path.join(srcDir, 'rollback.ts'), REQUIRED_FILES['src/rollback.ts']);

  // Check and create utils files
  checkAndCreate(path.join(utilsDir, 'relayer.ts'), REQUIRED_FILES['src/utils/relayer.ts']);
  checkAndCreate(path.join(utilsDir, 'pdas.ts'), REQUIRED_FILES['src/utils/pdas.ts']);
  checkAndCreate(path.join(utilsDir, 'wallet.ts'), REQUIRED_FILES['src/utils/wallet.ts']);
  checkAndCreate(path.join(utilsDir, 'checkEnv.ts'), REQUIRED_FILES['src/utils/checkEnv.ts']);

  if (!allFilesPresent) {
    console.log('Installing dependencies due to new package.json...');
    try {
      execSync('npm install', { stdio: 'inherit' });
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
    new PublicKey(process.env.TREASURY_PUBKEY!);
    if (process.env.DAO_PUBKEY) new PublicKey(process.env.DAO_PUBKEY);
  } catch (e) {
    console.error('Invalid public key in .env');
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
  const mintCachePath = path.join(__dirname, '../.cache/mint.json');
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);

  console.log('\n📊 Deployment Status:');
  if (!fs.existsSync(mintCachePath)) {
    console.log('❌ Mint not created. Run `npm run mainnet:create-mint`.');
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

    const treasuryAta = PublicKey.findProgramAddressSync(
      [treasuryPubkey.toBuffer(), TOKEN_2022_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    )[0];
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

async function runDeploymentStep(step: string): Promise<void> {
  try {
    console.log(`Running ${step}...`);
    const output = execSync(`npm run ${step}`, { encoding: 'utf-8' });
    console.log(output);
  } catch (e) {
    console.error(`Failed to run ${step}: ${e.message}`);
  }
}

async function grokCopilot() {
  console.log('🚀 Grok Copilot for Omega Prime Token Deployment');
  console.log('-----------------------------------------------');

  console.log('\n🔍 Checking for required files...');
  const allFilesPresent = await checkAndCreateFiles();
  if (!allFilesPresent) {
    console.log('✅ Created missing files. Please verify and commit changes before proceeding.');
    console.log('Run:');
    console.log('  git add .');
    console.log('  git commit -m "Add missing files for Omega Prime Token deployment"');
    console.log('  git push origin main');
    console.log('Then restart the copilot: npm run mainnet:copilot');
    rl.close();
    process.exit(0);
  }

  if (!(await checkEnv())) {
    console.error('🛑 Environment check failed. Please fix .env and try again.');
    rl.close();
    process.exit(1);
  }

  console.log('\n🔍 Checking deployment status...');
  await checkDeploymentStatus();

  while (true) {
    console.log('\n📋 Available Actions:');
    console.log('1. Run full deployment (mainnet:all)');
    console.log('2. Create mint (mainnet:create-mint)');
    console.log('3. Mint initial supply (mainnet:mint-initial)');
    console.log('4. Set metadata (mainnet:set-metadata)');
    console.log('5. Lock authorities (mainnet:lock)');
    console.log('6. Check deployment status');
    console.log('7. Run dry-run (all steps)');
    console.log('8. Exit');

    const choice = await askQuestion('Select an action (1-8): ');

    switch (choice) {
      case '1':
        await runDeploymentStep('mainnet:all');
        break;
      case '2':
        await runDeploymentStep('mainnet:create-mint');
        break;
      case '3':
        await runDeploymentStep('mainnet:mint-initial');
        break;
      case '4':
        await runDeploymentStep('mainnet:set-metadata');
        break;
      case '5':
        await runDeploymentStep('mainnet:lock');
        break;
      case '6':
        await checkDeploymentStatus();
        break;
      case '7':
        console.log('Running dry-run...');
        execSync('DRY_RUN=true npm run mainnet:all', { encoding: 'utf-8', stdio: 'inherit' });
        break;
      case '8':
        console.log('👋 Exiting Grok Copilot');
        rl.close();
        process.exit(0);
      default:
        console.log('❌ Invalid choice. Please select 1-8.');
    }
  }
}

grokCopilot().catch((e) => {
  console.error(`Grok Copilot failed: ${e.message}`);
  rl.close();
  process.exit(1);
});
