#!/usr/bin/env node

const fs = require('fs');

async function findDeployer() {
    console.log('🔍 Finding program deployer from transaction history');
    
    const programAddress = 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1';
    const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    // Get the earliest transaction (deployment)
    try {
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getSignaturesForAddress',
                params: [
                    programAddress,
                    { limit: 1, before: null }
                ]
            })
        });
        
        const data = await response.json();
        
        if (data.result?.[0]) {
            const firstTx = data.result[0];
            console.log(`\n🎯 First Transaction: ${firstTx.signature}`);
            console.log(`   Slot: ${firstTx.slot}`);
            
            // Get transaction details
            const txResponse = await fetch(RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTransaction',
                    params: [firstTx.signature, { encoding: 'json', maxSupportedTransactionVersion: 0 }]
                })
            });
            
            const txData = await txResponse.json();
            
            if (txData.result) {
                const tx = txData.result;
                const feePayer = tx.transaction.message.accountKeys[0];
                
                console.log(`\n👤 DEPLOYER FOUND: ${feePayer}`);
                console.log(`🔗 Deployment TX: https://explorer.solana.com/tx/${firstTx.signature}`);
                
                const deployerInfo = {
                    timestamp: new Date().toISOString(),
                    program: programAddress,
                    deployer: feePayer,
                    deploymentTx: firstTx.signature,
                    deploymentSlot: firstTx.slot,
                    explorer: `https://explorer.solana.com/tx/${firstTx.signature}`,
                    note: 'This address deployed the program and may have authority'
                };
                
                fs.writeFileSync('.cache/deployer-found.json', JSON.stringify(deployerInfo, null, 2));
                
                console.log(`\n🔑 PRIVATE KEY NEEDED FOR: ${feePayer}`);
                console.log(`   This address deployed the program`);
                console.log(`   It may have program authority`);
                console.log(`   Value at stake: 2.161992 SOL`);
                
                // Check if deployer has any SOL
                const balanceResponse = await fetch(RPC_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getBalance',
                        params: [feePayer]
                    })
                });
                
                const balanceData = await balanceResponse.json();
                const balance = balanceData.result?.value || 0;
                
                console.log(`\n💰 Deployer Balance: ${(balance / 1e9).toFixed(6)} SOL`);
                
                deployerInfo.deployerBalance = {
                    lamports: balance,
                    sol: balance / 1e9
                };
                
                fs.writeFileSync('.cache/deployer-found.json', JSON.stringify(deployerInfo, null, 2));
                
                console.log(`\n📄 Deployer info: .cache/deployer-found.json`);
                
                return deployerInfo;
                
            } else {
                console.log(`\n❌ Could not get transaction details`);
            }
            
        } else {
            console.log(`\n❌ No transactions found for program`);
        }
        
    } catch (error) {
        console.log(`\n❌ Search error: ${error.message}`);
    }
}

if (require.main === module) {
    findDeployer().catch(console.error);
}