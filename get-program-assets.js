#!/usr/bin/env node

const fs = require('fs');

async function getProgramAssets() {
    console.log('🔍 Retrieving assets from Token Program and Core Solana Programs');
    
    const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
    const DEPLOYER = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
    
    const results = {
        timestamp: new Date().toISOString(),
        deployer: DEPLOYER,
        programs: {
            token: TOKEN_PROGRAM,
            system: '11111111111111111111111111111111',
            associated_token: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        },
        assets: []
    };
    
    // Get token accounts owned by deployer
    try {
        console.log(`\n📋 Scanning Token Program accounts for: ${DEPLOYER}`);
        
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenAccountsByOwner',
                params: [
                    DEPLOYER,
                    { programId: TOKEN_PROGRAM },
                    { encoding: 'jsonParsed' }
                ]
            })
        });
        
        const data = await response.json();
        
        if (data.result?.value) {
            console.log(`   ✅ Found ${data.result.value.length} token accounts`);
            
            for (const account of data.result.value) {
                const parsed = account.account.data.parsed.info;
                results.assets.push({
                    type: 'TOKEN_ACCOUNT',
                    address: account.pubkey,
                    mint: parsed.mint,
                    owner: parsed.owner,
                    amount: parsed.tokenAmount.uiAmount,
                    decimals: parsed.tokenAmount.decimals,
                    program: TOKEN_PROGRAM
                });
                
                console.log(`     🪙 ${account.pubkey}: ${parsed.tokenAmount.uiAmount} tokens`);
            }
        } else {
            console.log(`   ❌ No token accounts found`);
        }
        
    } catch (error) {
        console.log(`   ⚠️ Error scanning token accounts: ${error.message}`);
    }
    
    // Get program accounts owned by deployer
    try {
        console.log(`\n📋 Scanning for program accounts owned by: ${DEPLOYER}`);
        
        const programResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getProgramAccounts',
                params: [
                    '11111111111111111111111111111111',
                    {
                        filters: [
                            { memcmp: { offset: 32, bytes: DEPLOYER } }
                        ]
                    }
                ]
            })
        });
        
        const programData = await programResponse.json();
        
        if (programData.result) {
            console.log(`   ✅ Found ${programData.result.length} program accounts`);
            
            for (const account of programData.result) {
                results.assets.push({
                    type: 'PROGRAM_ACCOUNT',
                    address: account.pubkey,
                    owner: DEPLOYER,
                    lamports: account.account.lamports,
                    executable: account.account.executable,
                    program: '11111111111111111111111111111111'
                });
                
                console.log(`     🏗️ ${account.pubkey}: ${account.account.lamports} lamports`);
            }
        }
        
    } catch (error) {
        console.log(`   ⚠️ Error scanning program accounts: ${error.message}`);
    }
    
    // Check for mints created by deployer
    try {
        console.log(`\n📋 Scanning for mints with deployer as authority`);
        
        const mintResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getProgramAccounts',
                params: [
                    TOKEN_PROGRAM,
                    {
                        filters: [
                            { dataSize: 82 },
                            { memcmp: { offset: 4, bytes: DEPLOYER } }
                        ]
                    }
                ]
            })
        });
        
        const mintData = await mintResponse.json();
        
        if (mintData.result) {
            console.log(`   ✅ Found ${mintData.result.length} mints with deployer authority`);
            
            for (const mint of mintData.result) {
                results.assets.push({
                    type: 'TOKEN_MINT',
                    address: mint.pubkey,
                    authority: DEPLOYER,
                    lamports: mint.account.lamports,
                    program: TOKEN_PROGRAM
                });
                
                console.log(`     🏭 ${mint.pubkey}: Mint with authority`);
            }
        }
        
    } catch (error) {
        console.log(`   ⚠️ Error scanning mints: ${error.message}`);
    }
    
    // Save results
    fs.writeFileSync('.cache/program-assets.json', JSON.stringify(results, null, 2));
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Assets: ${results.assets.length}`);
    console.log(`   Token Accounts: ${results.assets.filter(a => a.type === 'TOKEN_ACCOUNT').length}`);
    console.log(`   Program Accounts: ${results.assets.filter(a => a.type === 'PROGRAM_ACCOUNT').length}`);
    console.log(`   Token Mints: ${results.assets.filter(a => a.type === 'TOKEN_MINT').length}`);
    console.log(`\n📄 Results saved to: .cache/program-assets.json`);
    
    return results;
}

if (require.main === module) {
    getProgramAssets().catch(console.error);
}