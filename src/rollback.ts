import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { findMetadataPda } from './utils/pdas';

dotenv.config();

async function rollback() {
  const cacheDir = path.join(process.cwd(), '.cache');
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
  console.log('Rollback complete. Run `npm run mainnet:all` to restart deployment.');
}

rollback().catch((e) => {
  console.error(`Rollback failed: ${e.message}`);
  process.exit(1);
});
