#!/usr/bin/env node

const fs = require('fs');

async function scanKnownAssets() {
    console.log('🔍 Scanning known assets from previous analysis');
    
    const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    // Known assets from previous scans
    const knownAssets = [
        'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', // Token mint
        'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt', // Upgradeable program
        'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1' // Program
    ];
    
    const results = {
        timestamp: new Date().toISOString(),
        scanned: knownAssets.length,
        assets: []
    };
    
    for (const asset of knownAssets) {
        console.log(`\n📋 Analyzing: ${asset}`);
        
        try {
            const response = await fetch(RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getAccountInfo',
                    params: [asset, { encoding: 'jsonParsed' }]
                })
            });
            
            const data = await response.json();
            
            if (data.result?.value) {
                const account = data.result.value;
                const assetInfo = {
                    address: asset,
                    owner: account.owner,
                    lamports: account.lamports,
                    executable: account.executable,
                    dataLength: account.data?.length || 0
                };
                
                // Determine asset type
                if (account.owner === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
                    if (account.data?.parsed) {
                        assetInfo.type = 'TOKEN_MINT';
                        assetInfo.mintAuthority = account.data.parsed.info.mintAuthority;
                        assetInfo.supply = account.data.parsed.info.supply;
                        assetInfo.decimals = account.data.parsed.info.decimals;
                    } else {
                        assetInfo.type = 'TOKEN_ACCOUNT';
                    }
                } else if (account.executable) {
                    assetInfo.type = 'PROGRAM';
                } else {
                    assetInfo.type = 'ACCOUNT';
                }
                
                results.assets.push(assetInfo);
                
                console.log(`   ✅ Type: ${assetInfo.type}`);
                console.log(`   💰 Lamports: ${assetInfo.lamports}`);
                console.log(`   👤 Owner: ${assetInfo.owner}`);
                
                if (assetInfo.mintAuthority) {
                    console.log(`   🔑 Mint Authority: ${assetInfo.mintAuthority}`);
                }
                
            } else {
                console.log(`   ❌ Account not found`);
            }
            
        } catch (error) {
            console.log(`   ⚠️ Error: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    fs.writeFileSync('.cache/known-assets-scan.json', JSON.stringify(results, null, 2));
    
    console.log(`\n📊 Asset Summary:`);
    console.log(`   Total Found: ${results.assets.length}/${knownAssets.length}`);
    console.log(`   Token Mints: ${results.assets.filter(a => a.type === 'TOKEN_MINT').length}`);
    console.log(`   Programs: ${results.assets.filter(a => a.type === 'PROGRAM').length}`);
    console.log(`   Total SOL: ${(results.assets.reduce((sum, a) => sum + a.lamports, 0) / 1e9).toFixed(6)} SOL`);
    console.log(`\n📄 Results: .cache/known-assets-scan.json`);
    
    return results;
}

if (require.main === module) {
    scanKnownAssets().catch(console.error);
}