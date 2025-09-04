import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction, TransactionInstruction, AddressLookupTableProgram, AddressLookupTableAccount } from '@solana/web3.js';
import { createMint, getMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, TOKEN_2022_PROGRAM_ID, getTokenAccountBalance } from '@solana/spl-token';
import { createMetadataAccountV3, updateMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createInterface } from 'readline';

dotenv.config();

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
- A treasury public key (TREASURY_PUBKEY)
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

## Post-Deploy Checklist
1. Verify mint: \`https://explorer.solana.com/address/<MINT_ADDRESS>\`
2. Check treasury ATA: \`https://explorer.solana.com/address/<TREASURY_ATA>\`
3. Confirm metadata and authorities via Explorer.
`,
  '.github/workflows/deploy.yml': `
name: Deploy Omega Prime Token

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run deployment
        env:
          RPC_URL: \${{ secrets.RPC_URL }}
          RELAYER_URL: \${{ secrets.RELAYER_URL }}
          RELAYER_PUBKEY: \${{ secrets.RELAYER_PUBKEY }}
          TREASURY_PUBKEY: \${{ secrets.TREASURY_PUBKEY }}
          DAO_PUBKEY: \${{ secrets.DAO_PUBKEY }}
          AUTHORITY_MODE: \${{ secrets.AUTHORITY_MODE }}
          DRY_RUN: false
          RELAYER_API_KEY: \${{ secrets.RELAYER_API_KEY }}
        run: npm run mainnet:all
`
};

// Utility Functions (same as previous, omitted for brevity)

async function checkAndCreateFiles(): Promise<boolean> {
  // same as previous, omitted for brevity
}

async function checkEnv(): Promise<boolean> {
  // same as previous, omitted for brevity
}

async function checkDeploymentStatus(): Promise<void> {
  // same as previous, omitted for brevity
}

async function runAllSteps(): Promise<void> {
  // same as previous, omitted for brevity
}

async function grokCopilot() {
  // same as previous, omitted for brevity
}

grokCopilot().catch((e) => {
  console.error(`Grok Copilot failed: ${e.message}`);
  rl.close();
  process.exit(1);
});
