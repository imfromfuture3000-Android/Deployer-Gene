import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { createSetAuthorityInstruction, TOKEN_2022_PROGRAM_ID, AuthorityType } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendViaRelayer } from './utils/relayer';
import { loadDeployerAuth } from './utils/deployerAuth';
import { createSecureConnection } from './utils/securityConfig';

dotenv.config();

async function lockAuthorities() {
  const connection = createSecureConnection('confirmed');
  const userAuth = loadDeployerAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  const controllerPubkey = userAuth.publicKey;
  const cocreatorPubkey = new PublicKey(process.env.COCREATOR_PUBKEY!);
  const authorityMode = process.env.AUTHORITY_MODE || 'custom';
  const cacheDir = path.join(process.cwd(), '.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');
  const mintKeypairPath = path.join(cacheDir, 'mint-keypair.json');

  if (!fs.existsSync(mintCachePath) || !fs.existsSync(mintKeypairPath)) {
    console.error('Mint not created. Run createMint.ts first.');
    process.exit(1);
  }
  const mintKeypairJson = JSON.parse(fs.readFileSync(mintKeypairPath, 'utf-8'));
  const mintKeypair = Keypair.fromSecretKey(Uint8Array.from(mintKeypairJson));
  const mint = mintKeypair.publicKey;

  // Set MintTokens authority to deployer (master controller), FreezeAccount authority to co-creator
  const authoritySettings = [
    { type: AuthorityType.MintTokens, newAuthority: controllerPubkey },
    { type: AuthorityType.FreezeAccount, newAuthority: cocreatorPubkey }
  ];

  for (const { type, newAuthority } of authoritySettings) {
    const tx = new Transaction();
    tx.add(
      createSetAuthorityInstruction(
        mint,
        userAuth.publicKey,
        type,
        newAuthority,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
    tx.feePayer = userAuth.publicKey;
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.partialSign(userAuth);
    try {
      await sendViaRelayer(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
      console.log(`✅ Authority ${AuthorityType[type]} set to ${newAuthority.toBase58()}`);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`❌ Authority setting failed: ${errMsg}`);
      process.exit(1);
    }
  }

  console.log(`Mint ${mint.toBase58()} authorities updated.`);
}

lockAuthorities().catch((e) => {
  console.error(`Lock authorities failed: ${e.message}`);
  process.exit(1);
});
