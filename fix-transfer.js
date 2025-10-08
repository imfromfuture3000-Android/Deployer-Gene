#!/usr/bin/env node

const fs = require('fs');

async function fixTransfer() {
    console.log('🔧 Fixing transfer - Identifying required private keys');
    
    const knownAssets = JSON.parse(fs.readFileSync('.cache/known-assets-scan.json', 'utf8'));
    const BACKPACK_WALLET = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';
    
    const requirements = {
        timestamp: new Date().toISOString(),
        destination: BACKPACK_WALLET,
        requiredKeys: [],
        transfers: []
    };
    
    console.log(`🎯 Destination: ${BACKPACK_WALLET}`);
    
    for (const asset of knownAssets.assets) {
        console.log(`\n📋 Asset: ${asset.address}`);
        console.log(`   Type: ${asset.type}`);
        console.log(`   Value: ${(asset.lamports / 1e9).toFixed(6)} SOL`);
        
        let requiredKey = null;
        let transferMethod = null;
        
        if (asset.type === 'TOKEN_MINT') {
            // Token mint - need mint authority or upgrade authority
            requiredKey = asset.mintAuthority || 'MINT_AUTHORITY_BURNED';
            transferMethod = 'close_mint_account';
            console.log(`   🔑 Required: Mint Authority (${requiredKey})`);
            
        } else if (asset.type === 'PROGRAM') {
            // Program - need upgrade authority or program authority
            if (asset.owner === 'BPFLoaderUpgradeab1e11111111111111111111111') {
                requiredKey = 'UPGRADE_AUTHORITY';
                transferMethod = 'close_program_account';
            } else {
                requiredKey = 'PROGRAM_AUTHORITY';
                transferMethod = 'close_program_data';
            }
            console.log(`   🔑 Required: ${requiredKey}`);
        }
        
        const transferAmount = asset.lamports - 890880;
        
        requirements.transfers.push({
            asset: asset.address,
            type: asset.type,
            lamports: transferAmount,
            solAmount: transferAmount / 1e9,
            requiredKey,
            transferMethod,
            status: requiredKey === 'MINT_AUTHORITY_BURNED' ? 'IMPOSSIBLE' : 'NEEDS_KEY'
        });
        
        if (requiredKey && requiredKey !== 'MINT_AUTHORITY_BURNED') {
            requirements.requiredKeys.push({
                address: asset.address,
                keyType: requiredKey,
                purpose: `Transfer ${(transferAmount / 1e9).toFixed(6)} SOL from ${asset.type}`
            });
        }
    }
    
    // Create environment template
    const envTemplate = `# Required Private Keys for Transfer
# Add these to your .env file

# For Token Mint: GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz
# MINT_AUTHORITY_KEY=<private_key_base58>  # BURNED - Cannot transfer

# For Upgradeable Program: T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt
UPGRADE_AUTHORITY_KEY=<private_key_base58>

# For Program: DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1
PROGRAM_AUTHORITY_KEY=<private_key_base58>

# Relayer Configuration
RELAYER_URL=https://your-relayer.com/relay
RELAYER_API_KEY=<your_api_key>
`;
    
    fs.writeFileSync('.env.transfer-template', envTemplate);
    fs.writeFileSync('.cache/transfer-requirements.json', JSON.stringify(requirements, null, 2));
    
    console.log(`\n📊 Transfer Requirements:`);
    console.log(`   Total Assets: ${requirements.transfers.length}`);
    console.log(`   Transferable: ${requirements.transfers.filter(t => t.status === 'NEEDS_KEY').length}`);
    console.log(`   Impossible: ${requirements.transfers.filter(t => t.status === 'IMPOSSIBLE').length}`);
    
    console.log(`\n🔑 Required Private Keys:`);
    requirements.requiredKeys.forEach(key => {
        console.log(`   ${key.keyType}: ${key.purpose}`);
    });
    
    console.log(`\n📄 Files created:`);
    console.log(`   .env.transfer-template - Environment configuration`);
    console.log(`   .cache/transfer-requirements.json - Full requirements`);
    
    console.log(`\n⚠️  CRITICAL: You need the private keys for:`);
    console.log(`   - Upgrade Authority for upgradeable programs`);
    console.log(`   - Program Authority for standard programs`);
    console.log(`   - Token mint authority is BURNED (cannot transfer)`);
    
    return requirements;
}

if (require.main === module) {
    fixTransfer().catch(console.error);
}