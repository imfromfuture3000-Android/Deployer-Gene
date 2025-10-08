#!/usr/bin/env node

const { Connection, PublicKey, Transaction } = require('@solana/web3.js');
const { getAccount, getMint, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');

async function getAddressInfo(address) {
    try {
        const pubkey = new PublicKey(address);
        const accountInfo = await connection.getAccountInfo(pubkey);
        
        if (!accountInfo) return { address, type: 'NOT_FOUND', owner: null };
        
        // Check if it's a token mint
        if (accountInfo.owner.equals(TOKEN_PROGRAM_ID) && accountInfo.data.length === 82) {
            const mintInfo = await getMint(connection, pubkey);
            return {
                address,
                type: 'TOKEN_MINT',
                owner: accountInfo.owner.toString(),
                mintAuthority: mintInfo.mintAuthority?.toString() || null,
                freezeAuthority: mintInfo.freezeAuthority?.toString() || null,
                supply: mintInfo.supply.toString(),
                decimals: mintInfo.decimals
            };
        }
        
        // Check if it's a token account
        if (accountInfo.owner.equals(TOKEN_PROGRAM_ID) && accountInfo.data.length === 165) {
            const tokenAccount = await getAccount(connection, pubkey);
            return {
                address,
                type: 'TOKEN_ACCOUNT',
                owner: accountInfo.owner.toString(),
                mint: tokenAccount.mint.toString(),
                tokenOwner: tokenAccount.owner.toString(),
                amount: tokenAccount.amount.toString()
            };
        }
        
        return {
            address,
            type: 'PROGRAM_ACCOUNT',
            owner: accountInfo.owner.toString(),
            executable: accountInfo.executable,
            lamports: accountInfo.lamports,
            dataLength: accountInfo.data.length
        };
        
    } catch (error) {
        return { address, type: 'ERROR', error: error.message };
    }
}

async function processAddresses() {
    console.log('🔍 Processing addresses for ownership transfer...');
    
    // Load addresses from scan
    const scanData = JSON.parse(fs.readFileSync('.cache/contract-address-scan.json', 'utf8'));
    const addresses = Array.from(scanData.addressAnalysis.unknown).slice(0, 10); // Process first 10
    
    const results = [];
    
    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        console.log(`\n📋 Processing ${i + 1}/${addresses.length}: ${address}`);
        
        const info = await getAddressInfo(address);
        results.push(info);
        
        console.log(`   Type: ${info.type}`);
        if (info.owner) console.log(`   Owner: ${info.owner}`);
        if (info.mintAuthority) console.log(`   Mint Authority: ${info.mintAuthority}`);
        if (info.freezeAuthority) console.log(`   Freeze Authority: ${info.freezeAuthority}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Save results
    const outputPath = '.cache/ownership-analysis.json';
    fs.writeFileSync(outputPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        processed: results.length,
        results
    }, null, 2));
    
    console.log(`\n📄 Analysis saved to: ${outputPath}`);
    
    // Show transferable assets
    const transferable = results.filter(r => 
        r.type === 'TOKEN_MINT' && 
        r.mintAuthority && 
        r.mintAuthority !== 'null'
    );
    
    console.log(`\n🔄 Transferable assets found: ${transferable.length}`);
    transferable.forEach(asset => {
        console.log(`   🪙 ${asset.address} (Authority: ${asset.mintAuthority})`);
    });
    
    return results;
}

if (require.main === module) {
    processAddresses().catch(console.error);
}

module.exports = { processAddresses, getAddressInfo };