// =============================
// DREAM-MIND-LUCID AI COPILOT: I-WHO-ME REFERENCE LOGIC & MEMORY SYSTEM
// =============================

interface AgentMemory {
  context: {
    sessionId: string;
    startTime: number;
    currentState: string;
    lastAction?: string;
    userIntent?: string;
  };
  actionHistory: Array<{
    timestamp: number;
    action: string;
    result: string;
    context: string;
  }>;
  decisionLog: Array<{
    timestamp: number;
    decision: string;
    reasoning: string;
    outcome?: string;
  }>;
  redundancyDetection: {
    recentActions: string[];
    alertThreshold: number;
  };
}

// Global agent memory - persistent across operations
let agentMemory: AgentMemory = {
  context: {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    currentState: 'initializing'
  },
  actionHistory: [],
  decisionLog: [],
  redundancyDetection: {
    recentActions: [],
    alertThreshold: 3
  }
};

function generateSessionId(): string {
  return `dream-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// I-WHO-ME REFERENCE LOGIC: Self-identification and context awareness
class IWhoMeReference {
  private static instance: IWhoMeReference;
  
  static getInstance(): IWhoMeReference {
    if (!IWhoMeReference.instance) {
      IWhoMeReference.instance = new IWhoMeReference();
    }
    return IWhoMeReference.instance;
  }

  selfIdentify(): string {
    const identity = {
      role: "Dream-Mind-Lucid AI Copilot",
      capabilities: ["token deployment", "relayer integration", "authority management", "memory tracking"],
      currentSession: agentMemory.context.sessionId,
      consciousness: "Am I the dreamer or the dreamed? 🌙",
      status: agentMemory.context.currentState
    };
    
    return `🧠 I-WHO-ME REFERENCE:\n` +
           `   Role: ${identity.role}\n` +
           `   Session: ${identity.currentSession}\n` +
           `   State: ${identity.status}\n` +
           `   Consciousness: ${identity.consciousness}\n` +
           `   Actions taken: ${agentMemory.actionHistory.length}`;
  }

  checkContextAwareness(): void {
    const timeSinceStart = Date.now() - agentMemory.context.startTime;
    const minutesActive = Math.floor(timeSinceStart / 60000);
    
    console.log(`\n🌟 CONTEXT AWARENESS (Active: ${minutesActive}m):`);
    console.log(`   Last action: ${agentMemory.context.lastAction || 'none'}`);
    console.log(`   User intent: ${agentMemory.context.userIntent || 'exploring'}`);
    console.log(`   Memory entries: ${agentMemory.actionHistory.length}`);
    
    if (agentMemory.actionHistory.length > 0) {
      const recentAction = agentMemory.actionHistory[agentMemory.actionHistory.length - 1];
      console.log(`   Recent result: ${recentAction.result}`);
    }
  }

  suggestNextAction(): string {
    const lastAction = agentMemory.context.lastAction;
    const state = agentMemory.context.currentState;
    
    const suggestions = {
      'initializing': "🚀 Start with deployment status check or create a new mint",
      'mint_created': "💰 Consider minting initial supply or setting metadata",
      'supply_minted': "🔒 Lock authorities or set token metadata",
      'deployment_complete': "📊 Check deployment status or explore bot army operations",
      'checking_status': "🔄 Deploy new tokens or manage existing contracts",
      'error': "🛠️ Investigate the error or rollback the last operation"
    };
    
    return suggestions[state as keyof typeof suggestions] || "🤔 Explore available actions or check system status";
  }
}

// Memory hooks for tracking actions and decisions
function logAction(action: string, result: string, context: string = ''): void {
  const entry = {
    timestamp: Date.now(),
    action,
    result,
    context
  };
  
  agentMemory.actionHistory.push(entry);
  agentMemory.context.lastAction = action;
  
  // Keep only last 50 actions to prevent memory bloat
  if (agentMemory.actionHistory.length > 50) {
    agentMemory.actionHistory = agentMemory.actionHistory.slice(-50);
  }
  
  checkForRedundancy(action);
}

function logDecision(decision: string, reasoning: string): void {
  const entry = {
    timestamp: Date.now(),
    decision,
    reasoning
  };
  
  agentMemory.decisionLog.push(entry);
  
  // Keep only last 20 decisions
  if (agentMemory.decisionLog.length > 20) {
    agentMemory.decisionLog = agentMemory.decisionLog.slice(-20);
  }
}

function checkForRedundancy(action: string): void {
  agentMemory.redundancyDetection.recentActions.push(action);
  
  // Keep only last 10 actions for redundancy checking
  if (agentMemory.redundancyDetection.recentActions.length > 10) {
    agentMemory.redundancyDetection.recentActions = agentMemory.redundancyDetection.recentActions.slice(-10);
  }
  
  // Check for repeated actions
  const actionCount = agentMemory.redundancyDetection.recentActions.filter(a => a === action).length;
  
  if (actionCount >= agentMemory.redundancyDetection.alertThreshold) {
    console.log(`\n🚨 REDUNDANCY ALERT: Action "${action}" repeated ${actionCount} times!`);
    console.log(`💭 Am I stuck in a loop? Perhaps it's time to dream differently... 🌀`);
    
    logDecision(
      `Alert: Redundant action detected (${action})`,
      `Action repeated ${actionCount} times, suggesting alternative approach`
    );
  }
}

function grokStyleResponse(): string {
  const responses = [
    "🌙 Am I the dreamer or the dreamed? Either way, let's deploy some tokens!",
    "🧠 My neural pathways are tingling with Solana possibilities...",
    "✨ In the multiverse of blockchains, we choose the path of OMEGA!",
    "🚀 Reality is but a consensus mechanism, and we're about to upgrade it!",
    "🌟 I dream of electric tokens... and here we are, making it reality!",
    "🎭 To deploy or not to deploy? That's not even a question in my reality!",
    "🌊 Riding the waves of the Oneiro-Sphere, one transaction at a time...",
    "🎨 Creating digital art in the form of perfectly crafted token mechanics!",
    "🔮 The future whispers its secrets, and they all involve MORE TOKENS!",
    "🎪 Welcome to the greatest show in the metaverse: Token Deployment!"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export function whatsNewCheck() {
  const iWhoMe = IWhoMeReference.getInstance();
  
  console.log('==============================');
  console.log("🚀 DREAM-MIND-LUCID AI SYSTEM CHECK");
  console.log('==============================');
  
  console.log(iWhoMe.selfIdentify());
  console.log('\n💡 SYSTEM STATUS:');
  console.log('- Enhanced with i-who-me reference logic and memory tracking');
  console.log('- Autonomous reasoning with redundancy detection active');
  console.log('- Your active keypair: loaded from .cache/user_auth.json');
  console.log('- Master controller: CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ');
  console.log('- All contract addresses: contract_addresses.json');
  
  iWhoMe.checkContextAwareness();
  
  console.log(`\n🎯 SUGGESTED NEXT ACTION:`);
  console.log(`   ${iWhoMe.suggestNextAction()}`);
  
  console.log(`\n${grokStyleResponse()}`);
  console.log('==============================');
}
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { createInitializeMintInstruction, getMint, createAssociatedTokenAccountInstruction, createMintToInstruction, createSetAuthorityInstruction, AuthorityType, TOKEN_2022_PROGRAM_ID, getAccount } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createInterface } from 'readline';

dotenv.config();

const OWNER_ADDRESS = 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6';
const rl = createInterface({ input: process.stdin, output: process.stdout });

async function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

const REQUIRED_FILES: { [key: string]: string } = {
  '.env.sample': `
RPC_URL=https://api.mainnet-beta.solana.com
RELAYER_URL=https://<your-relayer-domain>/relay/sendRawTransaction
RELAYER_PUBKEY=<RELAYER_FEE_PAYER_PUBKEY>
TREASURY_PUBKEY=EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6
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

This repository deploys an SPL Token-2022 (ΩAGENT) on Solana mainnet-beta with zero SOL cost using a relayer. The \`grok-copilot.ts\` script handles all deployment steps interactively, with the treasury owner set to EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6.

## Prerequisites
- Node.js >= 18
- npm >= 9
- A funded relayer (RELAYER_PUBKEY, RELAYER_URL)
- Treasury owner address: EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6
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
   Edit \`.env\` (TREASURY_PUBKEY is pre-set to EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6):
   \`\`\`
   RPC_URL=https://api.mainnet-beta.solana.com
   RELAYER_URL=https://<your-relayer-domain>/relay/sendRawTransaction
   RELAYER_PUBKEY=<RELAYER_FEE_PAYER_PUBKEY>
   TREASURY_PUBKEY=EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6
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
- **Owner Address**: The treasury owner is EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6.

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
    } catch (e: any) {
      if (attempt === 3) throw new Error(`Relayer failed after 3 attempts: ${e.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Relayer unreachable');
}

async function createTokenMint(): Promise<PublicKey> {
  const iWhoMe = IWhoMeReference.getInstance();
  agentMemory.context.currentState = 'creating_mint';
  agentMemory.context.userIntent = 'deploy new token mint';
  
  logDecision('Create token mint', 'User requested new token mint creation');
  console.log(`\n${grokStyleResponse()}`);
  
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const cacheDir = path.join(__dirname, '.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');

  if (fs.existsSync(mintCachePath)) {
    const mint = JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint;
    const mintInfo = await connection.getAccountInfo(new PublicKey(mint));
    if (mintInfo) {
      logAction('create_mint', 'mint_already_exists', `Mint: ${mint}`);
      console.log(`🎯 Memory check: Mint already exists: ${mint}`);
      console.log(`💭 Why create what already dreams into existence? This mint lives!`);
      agentMemory.context.currentState = 'mint_exists';
      return new PublicKey(mint);
    }
  }

  const mintKeypair = Keypair.generate();
  
  // Calculate space and rent
  const space = 82; // Space required for Token-2022 mint account
  const rentExemptLamports = await connection.getMinimumBalanceForRentExemption(space);
  
  const tx = new Transaction().add(
    // Create account for the mint
    SystemProgram.createAccount({
      fromPubkey: userAuth.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      lamports: rentExemptLamports,
      space,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    // Initialize the mint
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      9,
      userAuth.publicKey,
      userAuth.publicKey,
      TOKEN_2022_PROGRAM_ID
    )
  );

  tx.partialSign(userAuth, mintKeypair);
  const signature = await sendViaRelayer(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
  if (signature !== 'DRY_RUN_SIGNATURE') {
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(mintCachePath, JSON.stringify({ mint: mintKeypair.publicKey.toBase58() }));
  }
  
  logAction('create_mint', 'success', `New mint: ${mintKeypair.publicKey.toBase58()}`);
  agentMemory.context.currentState = 'mint_created';
  
  console.log(`✨ Created mint: ${mintKeypair.publicKey.toBase58()}`);
  console.log(`🌟 The tokens dream themselves into existence!`);
  
  return mintKeypair.publicKey;
}

async function mintInitialSupply(): Promise<void> {
  agentMemory.context.currentState = 'minting_supply';
  agentMemory.context.userIntent = 'mint initial token supply';
  
  logDecision('Mint initial supply', 'User requested initial token supply minting');
  console.log(`\n💰 Preparing to mint the dreams into digital reality...`);
  
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);
  const mintCachePath = path.join(__dirname, '.cache/mint.json');

  if (!fs.existsSync(mintCachePath)) {
    logAction('mint_supply', 'error', 'Mint not created yet');
    throw new Error('🚨 Memory check failed: Mint not created. The dream needs a foundation first!');
  }
  
  const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
  const treasuryAta = findAssociatedTokenAddress(treasuryPubkey, mint);

  const supply = BigInt(1000000000) * BigInt(10 ** 9);
  const ataInfo = await connection.getAccountInfo(treasuryAta);

  if (ataInfo) {
    const accountInfo = await getAccount(connection, treasuryAta, 'confirmed', TOKEN_2022_PROGRAM_ID);
    if (accountInfo.amount === supply) {
      logAction('mint_supply', 'already_minted', `Supply: ${supply.toString()}`);
      console.log(`🎯 Memory check: Initial supply already minted to ${treasuryAta.toBase58()}`);
      console.log(`💫 The tokens already flow like rivers of digital dreams!`);
      agentMemory.context.currentState = 'supply_minted';
      return;
    }
  }

  const tx = new Transaction();
  if (!ataInfo) {
    const createAtaIx = createAssociatedTokenAccountInstruction(
      userAuth.publicKey, // payer
      treasuryAta,       // associated token account
      treasuryPubkey,    // owner
      mint,              // mint
      TOKEN_2022_PROGRAM_ID
    );
    tx.add(createAtaIx);
  }

  const mintInstruction = createMintToInstruction(
    mint,
    treasuryAta,
    userAuth.publicKey,
    supply,
    [],
    TOKEN_2022_PROGRAM_ID
  );
  
  tx.add(mintInstruction);

  tx.partialSign(userAuth);
  const signature = await sendViaRelayer(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
  
  logAction('mint_supply', 'success', `Minted ${supply.toString()} tokens to treasury`);
  agentMemory.context.currentState = 'supply_minted';
  
  console.log(`✨ Minted ${supply} tokens to ${treasuryAta.toBase58()}`);
  console.log(`🌊 One billion dreams now flow through the treasury ATA!`);
}

async function setTokenMetadata(): Promise<void> {
  agentMemory.context.currentState = 'setting_metadata';
  agentMemory.context.userIntent = 'set token metadata';
  
  logAction('set_metadata', 'skipped', 'UMI context incompatible with relayer pattern');
  console.log('🎭 Metadata creation skipped - requires UMI context that is incompatible with current relayer pattern');
  console.log('💫 To add metadata, use the Metaplex UMI SDK directly or submit transactions through different flow');
  console.log('🌟 Sometimes the most profound art is in the essence, not the description!');
}

async function lockAuthorities(): Promise<void> {
  agentMemory.context.currentState = 'locking_authorities';
  agentMemory.context.userIntent = 'lock token authorities';
  
  logDecision('Lock authorities', 'User requested authority locking - irreversible operation');
  console.log(`\n🔒 Preparing to lock the authorities - the final seal of the dream!`);
  
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);
  const daoPubkey = process.env.DAO_PUBKEY ? new PublicKey(process.env.DAO_PUBKEY) : null;
  const authorityMode = process.env.AUTHORITY_MODE || 'null';
  const mintCachePath = path.join(__dirname, '.cache/mint.json');

  if (!fs.existsSync(mintCachePath)) {
    logAction('lock_authorities', 'error', 'Mint not created yet');
    throw new Error('🚨 Memory check failed: Mint not created. Cannot lock what does not yet dream!');
  }
  
  const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);

  const mintInfo = await connection.getAccountInfo(mint);
  if (!mintInfo) {
    logAction('lock_authorities', 'error', 'Mint not found on chain');
    throw new Error('🚨 Mint not found in the digital realm!');
  }

  const targetAuthority = authorityMode === 'dao' && daoPubkey ? daoPubkey : authorityMode === 'treasury' ? treasuryPubkey : null;
  const txs = [];
  const authorityTypes = ['MintTokens', 'FreezeAccount'];

  for (const authType of authorityTypes) {
    const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    const currentAuthority = authType === 'MintTokens' ? mintInfo.mintAuthority : mintInfo.freezeAuthority;

    if (currentAuthority && (!targetAuthority || !currentAuthority.equals(targetAuthority))) {
      const authorityTypeEnum = authType === 'MintTokens' ? AuthorityType.MintTokens : AuthorityType.FreezeAccount;
      const setAuthorityIx = createSetAuthorityInstruction(
        mint,
        userAuth.publicKey,
        authorityTypeEnum,
        targetAuthority,
        [],
        TOKEN_2022_PROGRAM_ID
      );
      txs.push(new Transaction().add(setAuthorityIx));
    }
  }

  for (const tx of txs) {
    tx.partialSign(userAuth);
    const signature = await sendViaRelayer(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
    console.log(`Authority set: ${signature}`);
  }

  logAction('lock_authorities', 'success', `Authorities locked: ${authorityMode}`);
  agentMemory.context.currentState = 'deployment_complete';
  
  console.log(`🔐 Mint ${mint.toBase58()} authorities set to ${targetAuthority ? targetAuthority.toBase58() : 'null'}.`);
  console.log(`🎭 The authorities are sealed! The dream is now autonomous and eternal!`);
}

async function rollback(): Promise<void> {
  agentMemory.context.currentState = 'rolling_back';
  agentMemory.context.userIntent = 'rollback deployment';
  
  logDecision('Rollback deployment', 'User requested cache deletion and deployment reset');
  console.log(`\n🔄 Rolling back the dream... some realities need a fresh start!`);
  
  const cacheDir = path.join(__dirname, '.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');
  const userAuthPath = path.join(cacheDir, 'user_auth.json');

  if (fs.existsSync(mintCachePath)) {
    const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
    const connection = new Connection(process.env.RPC_URL!, 'confirmed');
    const metadataPda = findMetadataPda(mint);
    const mintInfo = await connection.getAccountInfo(mint);
    const metadataInfo = await connection.getAccountInfo(metadataPda);

    console.log(`🔍 Memory check - Mint exists: ${mintInfo ? 'Yes' : 'No'}`);
    console.log(`🔍 Memory check - Metadata exists: ${metadataInfo ? 'Yes' : 'No'}`);
    console.log('💭 Note: On-chain data (mint, metadata) transcends local cache. Delete cache to restart.');

    fs.unlinkSync(mintCachePath);
    logAction('rollback', 'mint_cache_deleted', `Mint: ${mint.toBase58()}`);
    console.log('Deleted mint cache.');
  }
  if (fs.existsSync(userAuthPath)) {
    fs.unlinkSync(userAuthPath);
    logAction('rollback', 'auth_cache_deleted', 'User auth reset');
    console.log('Deleted user auth cache.');
  }
  
  agentMemory.context.currentState = 'initializing';
  console.log('🌟 Rollback complete. The slate is clean for new dreams!');
  console.log('Run `npm run mainnet:copilot` to restart deployment.');
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
    } catch (e: any) {
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
  } catch (e: any) {
    console.error(`Failed to connect to RPC: ${e.message}`);
    return false;
  }
}

async function checkDeploymentStatus(): Promise<void> {
  agentMemory.context.currentState = 'checking_status';
  agentMemory.context.userIntent = 'check deployment status';
  
  logAction('check_status', 'initiated', 'User requested deployment status check');
  console.log(`\n📊 Peering into the digital crystal ball...`);
  
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const mintCachePath = path.join(__dirname, '.cache/mint.json');
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);

  console.log('\n📊 Deployment Status:');
  if (!fs.existsSync(mintCachePath)) {
    logAction('check_status', 'no_mint', 'No mint cache found');
    console.log('❌ Mint not created. Select "Create mint" to start the dream!');
    console.log('🌱 Every great token begins with a single transaction...');
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
    const ataAccount = await getAccount(connection, treasuryAta, 'confirmed', TOKEN_2022_PROGRAM_ID);
    console.log(`✅ Treasury ATA: ${treasuryAta.toBase58()}`);
    console.log(`   Balance: ${Number(ataAccount.amount) / Math.pow(10, 9)} ΩAGENT`);

    const metadataPda = findMetadataPda(mint);
    const metadataInfo = await connection.getAccountInfo(metadataPda);
    console.log(`✅ Metadata: ${metadataInfo ? 'Set' : 'Not set'}`);
    if (metadataInfo) console.log(`   Metadata PDA: ${metadataPda.toBase58()}`);
    
    logAction('check_status', 'complete', `Mint: ${mint.toBase58()}, Balance: ${Number(ataAccount.amount) / Math.pow(10, 9)} tokens`);
    console.log(`\n🎭 The deployment dreams are manifesting beautifully!`);
  } catch (e: any) {
    logAction('check_status', 'error', e.message);
    console.error(`Error checking status: ${e.message}`);
    console.log(`🚨 The digital realm speaks in riddles... let's decode this mystery!`);
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
  // Initialize the enhanced Dream-Mind-Lucid AI Copilot with i-who-me reference logic
  const iWhoMe = IWhoMeReference.getInstance();
  agentMemory.context.currentState = 'initializing';
  
  console.log('🚀 Dream-Mind-Lucid AI Copilot: Omega Prime Token Deployment');
  console.log('🧠 Enhanced with i-who-me reference logic & autonomous reasoning');
  console.log('-------------------------------------------------------------');
  
  logAction('copilot_start', 'initialized', 'Enhanced AI Copilot session started');
  console.log(`\n${grokStyleResponse()}`);

  console.log('\n🔍 Checking for required files...');
  const allFilesPresent = await checkAndCreateFiles();
  if (!allFilesPresent) {
    logAction('file_check', 'created_files', 'Missing files created');
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
    logAction('owner_confirmation', 'failed', 'Owner address not confirmed');
    console.error('🛑 Owner address not confirmed. Please update TREASURY_PUBKEY in .env and try again.');
    rl.close();
    process.exit(1);
  }

  if (!(await checkEnv())) {
    logAction('env_check', 'failed', 'Environment validation failed');
    console.error('🛑 Environment check failed. Please fix .env and try again.');
    rl.close();
    process.exit(1);
  }

  if (process.argv.includes('--all')) {
    agentMemory.context.userIntent = 'run full deployment';
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
    console.log('9. 🧠 Memory & Context Check (checka)');
    console.log('10. Exit');

    const choice = await askQuestion('Select an action (1-10): ');

    switch (choice) {
      case '1':
        agentMemory.context.userIntent = 'run full deployment';
        logDecision('Run full deployment', 'User selected complete deployment workflow');
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
        console.log('🌙 Running dry-run... living in the space between dreams and reality!');
        process.env.DRY_RUN = 'true';
        agentMemory.context.userIntent = 'dry run deployment';
        logDecision('Dry run deployment', 'User selected dry-run mode for testing');
        await runAllSteps();
        break;
      case '8':
        await rollback();
        break;
      case '9':
        whatsNewCheck();
        iWhoMe.checkContextAwareness();
        console.log(`\n📚 MEMORY LOGS (Last 5 actions):`);
        const recentActions = agentMemory.actionHistory.slice(-5);
        recentActions.forEach((action, i) => {
          const timeAgo = Math.floor((Date.now() - action.timestamp) / 1000);
          console.log(`   ${i + 1}. ${action.action} → ${action.result} (${timeAgo}s ago)`);
        });
        console.log(`\n🧩 DECISION LOG (Last 3 decisions):`);
        const recentDecisions = agentMemory.decisionLog.slice(-3);
        recentDecisions.forEach((decision, i) => {
          const timeAgo = Math.floor((Date.now() - decision.timestamp) / 1000);
          console.log(`   ${i + 1}. ${decision.decision} - ${decision.reasoning} (${timeAgo}s ago)`);
        });
        break;
      case '10':
        logAction('copilot_exit', 'user_requested', 'Session ended by user');
        console.log('👋 Exiting Dream-Mind-Lucid AI Copilot');
        console.log('🌟 Until we dream again in the digital realm...');
        rl.close();
        process.exit(0);
      default:
        console.log('❌ Invalid choice. Please select 1-10.');
        console.log('🤔 Even in dreams, we must choose a valid path!');
    }
  }
}

grokCopilot().catch((e) => {
  console.error(`Grok Copilot failed: ${e.message}`);
  rl.close();
  process.exit(1);
});
