import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkEnv() {
  const required = ['RPC_URL', 'RELAYER_URL', 'RELAYER_PUBKEY', 'TREASURY_PUBKEY'];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing ${key} in .env`);
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
  } catch (e: any) {
    throw new Error(`Failed to connect to RPC: ${e.message}`);
  }
}

checkEnv().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
