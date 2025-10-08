#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Environment configuration
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// Known program addresses to scan
const KNOWN_PROGRAMS = [
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Program
    '11111111111111111111111111111111', // System Program
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', // Metaplex Token Metadata
    'So11111111111111111111111111111111111111112', // Wrapped SOL
];

async function scanPrograms() {
    console.log('🔍 Scanning all Solana programs...');
    
    const results = {
        timestamp: new Date().toISOString(),
        rpcUrl: RPC_URL,
        knownPrograms: [],
        deployedPrograms: [],
        programAccounts: [],
        errors: []
    };

    try {
        // Scan known programs
        for (const programId of KNOWN_PROGRAMS) {
            try {
                const pubkey = new PublicKey(programId);
                const accountInfo = await connection.getAccountInfo(pubkey);
                
                results.knownPrograms.push({
                    programId,
                    exists: !!accountInfo,
                    executable: accountInfo?.executable || false,
                    owner: accountInfo?.owner?.toString() || null,
                    lamports: accountInfo?.lamports || 0,
                    dataLength: accountInfo?.data?.length || 0
                });
                
                console.log(`✅ ${programId}: ${accountInfo ? 'EXISTS' : 'NOT FOUND'}`);
            } catch (error) {
                results.errors.push({
                    programId,
                    error: error.message
                });
                console.log(`❌ ${programId}: ERROR - ${error.message}`);
            }
        }

        // Scan for program accounts
        console.log('\n🔍 Scanning for program accounts...');
        const programAccounts = await connection.getProgramAccounts(
            new PublicKey('11111111111111111111111111111111'), // System Program
            {
                filters: [
                    { dataSize: 0 }, // Programs typically have no data
                    { memcmp: { offset: 0, bytes: '' } }
                ]
            }
        );

        results.programAccounts = programAccounts.slice(0, 100).map(account => ({
            pubkey: account.pubkey.toString(),
            executable: account.account.executable,
            owner: account.account.owner.toString(),
            lamports: account.account.lamports,
            dataLength: account.account.data.length
        }));

        console.log(`📊 Found ${programAccounts.length} program accounts (showing first 100)`);

        // Check deployer address programs
        const deployerAddress = process.env.DEPLOYER_PUBKEY || 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
        try {
            const deployerPubkey = new PublicKey(deployerAddress);
            const deployerPrograms = await connection.getProgramAccounts(deployerPubkey);
            
            results.deployedPrograms = deployerPrograms.map(account => ({
                pubkey: account.pubkey.toString(),
                executable: account.account.executable,
                owner: account.account.owner.toString(),
                lamports: account.account.lamports,
                dataLength: account.account.data.length
            }));

            console.log(`🚀 Deployer ${deployerAddress} has ${deployerPrograms.length} program accounts`);
        } catch (error) {
            results.errors.push({
                context: 'deployer_scan',
                error: error.message
            });
            console.log(`⚠️ Could not scan deployer programs: ${error.message}`);
        }

    } catch (error) {
        results.errors.push({
            context: 'general_scan',
            error: error.message
        });
        console.log(`❌ General scan error: ${error.message}`);
    }

    // Save results
    const outputPath = path.join(__dirname, '.cache', 'program-scan-results.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`\n📄 Results saved to: ${outputPath}`);
    console.log(`📊 Summary:`);
    console.log(`   Known Programs: ${results.knownPrograms.length}`);
    console.log(`   Deployed Programs: ${results.deployedPrograms.length}`);
    console.log(`   Program Accounts: ${results.programAccounts.length}`);
    console.log(`   Errors: ${results.errors.length}`);

    return results;
}

if (require.main === module) {
    scanPrograms().catch(console.error);
}

module.exports = { scanPrograms };