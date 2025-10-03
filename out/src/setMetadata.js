"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const umi_1 = require("@metaplex-foundation/umi");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
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
    const umi = (0, umi_bundle_defaults_1.createUmi)(process.env.RPC_URL);
    const mintKeypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(mintKeypairJson));
    umi.use((0, umi_1.keypairIdentity)(mintKeypair));
    const mint = (0, umi_1.publicKey)(mintKeypair.publicKey);
    // Use Metaplex's UMI-compatible PDA function
    const [metadataPda] = (0, mpl_token_metadata_1.findMetadataPda)(umi, { mint });
    const uri = `data:application/json;base64,${Buffer.from(JSON.stringify(METADATA)).toString('base64')}`;
    try {
        // Try to fetch metadata account to see if it exists
        let metadataExists = false;
        try {
            const metadataAccount = await umi.rpc.getAccount(metadataPda);
            metadataExists = metadataAccount.exists;
        }
        catch (e) {
            metadataExists = false;
        }
        if (metadataExists) {
            // Update existing metadata
            await (0, mpl_token_metadata_1.updateMetadataAccountV2)(umi, {
                metadata: metadataPda,
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
        }
        else {
            // Create new metadata
            await (0, mpl_token_metadata_1.createMetadataAccountV3)(umi, {
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
                collectionDetails: null
            }).sendAndConfirm(umi);
            console.log(`✅ Metadata created for mint ${mint.toString()}. URI: ${uri.slice(0, 50)}...`);
        }
    }
    catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(`❌ Metadata setting failed: ${errMsg}`);
        process.exit(1);
    }
}
setTokenMetadata().catch((e) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
});
