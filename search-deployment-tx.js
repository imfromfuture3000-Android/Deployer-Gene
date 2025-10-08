#!/usr/bin/env node

const fs = require('fs');

async function searchDeploymentTx() {
    console.log('🔍 Searching for program deployment transaction...');
    
    const programAddress = 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1';
    const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    console.log(`📋 Program: ${programAddress}`);
    
    try {
        // Get signatures for the program address
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getSignaturesForAddress',
                params: [
                    programAddress,
                    { limit: 50 }
                ]
            })
        });
        
        const data = await response.json();
        
        if (data.result && data.result.length > 0) {
            console.log(`\n✅ Found ${data.result.length} transactions`);
            
            const deploymentSearch = {
                timestamp: new Date().toISOString(),
                program: programAddress,
                totalSignatures: data.result.length,
                signatures: []
            };
            
            // Analyze each transaction
            for (let i = 0; i < Math.min(data.result.length, 10); i++) {
                const sig = data.result[i];
                console.log(`\n📋 TX ${i + 1}: ${sig.signature}`);
                console.log(`   Slot: ${sig.slot}`);
                console.log(`   Status: ${sig.err ? 'FAILED' : 'SUCCESS'}`);
                
                // Get transaction details
                try {
                    const txResponse = await fetch(RPC_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 1,
                            method: 'getTransaction',
                            params: [sig.signature, { encoding: 'jsonParsed' }]
                        })
                    });
                    
                    const txData = await txResponse.json();
                    
                    if (txData.result) {
                        const tx = txData.result;
                        const feePayer = tx.transaction.message.accountKeys[0];
                        
                        console.log(`   💰 Fee Payer: ${feePayer.pubkey || feePayer}`);
                        console.log(`   🔗 Explorer: https://explorer.solana.com/tx/${sig.signature}`);
                        
                        // Check if this looks like a deployment
                        const instructions = tx.transaction.message.instructions || [];
                        const isDeployment = instructions.some(ix => 
                            ix.programId === 'BPFLoader2111111111111111111111111111111111' ||
                            ix.program === 'bpf-loader'
                        );
                        
                        deploymentSearch.signatures.push({
                            signature: sig.signature,
                            slot: sig.slot,
                            feePayer: feePayer.pubkey || feePayer,
                            isDeployment,
                            explorer: `https://explorer.solana.com/tx/${sig.signature}`,
                            status: sig.err ? 'FAILED' : 'SUCCESS'
                        });
                        
                        if (isDeployment) {
                            console.log(`   🚀 DEPLOYMENT TRANSACTION FOUND!`);
                            console.log(`   👤 Deployer: ${feePayer.pubkey || feePayer}`);
                        }
                        
                    }
                    
                } catch (error) {
                    console.log(`   ⚠️ TX details error: ${error.message}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            fs.writeFileSync('.cache/deployment-search.json', JSON.stringify(deploymentSearch, null, 2));
            
            console.log(`\n📊 Search Results:`);
            console.log(`   Total Signatures: ${deploymentSearch.totalSignatures}`);
            console.log(`   Analyzed: ${deploymentSearch.signatures.length}`);
            console.log(`   Deployments: ${deploymentSearch.signatures.filter(s => s.isDeployment).length}`);
            
            const deployers = [...new Set(deploymentSearch.signatures.map(s => s.feePayer))];
            console.log(`\n👤 Unique Fee Payers (Potential Deployers):`);
            deployers.forEach(deployer => {
                console.log(`   ${deployer}`);
            });
            
            console.log(`\n📄 Results: .cache/deployment-search.json`);
            
        } else {
            console.log(`\n❌ No transaction signatures found for program`);
        }
        
    } catch (error) {
        console.log(`\n❌ Search error: ${error.message}`);
    }
}

if (require.main === module) {
    searchDeploymentTx().catch(console.error);
}