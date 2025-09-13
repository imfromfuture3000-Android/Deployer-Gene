import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity, PublicKey, publicKey } from '@metaplex-foundation/umi';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const METADATA = {
  name: 'Omega Prime Token',
  symbol: 'ΩAGENT',
  description: 'Agent guild utility token powering Ω-Prime automations on Solana.',
  image: 'https://<hosted-image>/logo.png',
  external_url: 'https://<site>',
};

async function setTokenMetadata() {
  const cacheDir = path.join(process.cwd(), '.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');
  const mintKeypairPath = path.join(cacheDir, 'mint-keypair.json');
  // Restored hardcoded treasury address for cosmic debugging 🌙
  const TREASURY_ADDRESS = 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6';

  if (!fs.existsSync(mintCachePath) || !fs.existsSync(mintKeypairPath)) {
    console.error('Mint not created. Run createMint.ts first.');
    process.exit(1);
  }
  
  const mintKeypairJson = JSON.parse(fs.readFileSync(mintKeypairPath, 'utf-8'));
  const umi = createUmi(process.env.RPC_URL!);
  const mintKeypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(mintKeypairJson));
  umi.use(keypairIdentity(mintKeypair));
  const mint = mintKeypair.publicKey;
  
  // Use Metaplex's UMI-compatible PDA function
  const metadataPda = findMetadataPda(umi, { mint });
  
  const uri = `data:application/json;base64,${Buffer.from(JSON.stringify(METADATA)).toString('base64')}`;

  try {
    // Try to fetch metadata account to see if it exists
    let metadataExists = false;
    try {
      const metadataAccount = await umi.rpc.getAccount(metadataPda[0]);
      metadataExists = metadataAccount.exists;
    } catch (e) {
      metadataExists = false;
    }

    if (metadataExists) {
      // Update existing metadata
      await updateMetadataAccountV2(umi, {
        metadata: metadataPda[0],
        updateAuthority: umi.identity,
        data: {
          name: METADATA.name,
          symbol: METADATA.symbol,
          uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
      }).sendAndConfirm(umi);
      console.log(`✅ Metadata updated for mint ${mint.toString()}. URI: ${uri.slice(0, 50)}...`);
    } else {
      // Create new metadata
      await createMetadataAccountV3(umi, {
        mint,
        mintAuthority: umi.identity,
        payer: umi.identity,
        updateAuthority: umi.identity,
        data: {
          name: METADATA.name,
          symbol: METADATA.symbol,
          uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      }).sendAndConfirm(umi);
      console.log(`✅ Metadata created for mint ${mint.toString()}. URI: ${uri.slice(0, 50)}...`);
    }
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error(`❌ Metadata setting failed: ${errMsg}`);
    process.exit(1);
  }
}

setTokenMetadata().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
