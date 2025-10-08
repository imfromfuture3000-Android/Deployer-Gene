#!/usr/bin/env node

const fs = require('fs');

async function executeMainnetTransfer() {
    console.log('🚀 EXECUTING MAINNET SOL TRANSFERS - REAL MONEY');
    console.log('⚠️  WARNING: This will execute actual blockchain transactions');
    
    const plan = JSON.parse(fs.readFileSync('.cache/sol-transfer-plan.json', 'utf8'));
    const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    console.log(`\n💰 Transferring ${plan.totalAmount.toFixed(6)} SOL to deployer`);
    console.log(`🎯 Target: ${plan.deployer}`);
    
    const results = [];
    
    for (let i = 0; i < plan.transfers.length; i++) {
        const transfer = plan.transfers[i];
        console.log(`\n📋 Transfer ${i + 1}/${plan.transfers.length}`);
        console.log(`   From: ${transfer.from}`);
        console.log(`   Amount: ${transfer.solAmount.toFixed(6)} SOL`);
        
        try {
            // Create system transfer instruction
            const transferInstruction = {
                programId: '11111111111111111111111111111111',
                keys: [
                    { pubkey: transfer.from, isSigner: true, isWritable: true },
                    { pubkey: transfer.to, isSigner: false, isWritable: true }
                ],
                data: Buffer.from([2, 0, 0, 0, ...new Uint8Array(new BigUint64Array([BigInt(transfer.lamports)]).buffer)])
            };
            
            // Create transaction
            const transaction = {
                recentBlockhash: await getRecentBlockhash(RPC_URL),
                feePayer: transfer.from,
                instructions: [transferInstruction]
            };
            
            console.log(`   🔄 Creating transaction...`);
            
            // Submit via RPC
            const response = await fetch(RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'sendTransaction',
                    params: [
                        Buffer.from(JSON.stringify(transaction)).toString('base64'),
                        { encoding: 'base64', skipPreflight: false }
                    ]
                })
            });
            
            const result = await response.json();
            
            if (result.result) {
                console.log(`   ✅ SUCCESS: ${result.result}`);
                console.log(`   🔗 Explorer: https://explorer.solana.com/tx/${result.result}`);
                
                results.push({
                    transfer,
                    signature: result.result,
                    status: 'SUCCESS',
                    explorer: `https://explorer.solana.com/tx/${result.result}`
                });
            } else {
                console.log(`   ❌ FAILED: ${result.error?.message || 'Unknown error'}`);
                results.push({
                    transfer,
                    status: 'FAILED',
                    error: result.error?.message || 'Unknown error'
                });
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            results.push({
                transfer,
                status: 'ERROR',
                error: error.message
            });
        }
        
        // Wait between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Save execution results
    const executionReport = {
        timestamp: new Date().toISOString(),
        action: 'mainnet_sol_transfer',
        totalTransfers: plan.transfers.length,
        successful: results.filter(r => r.status === 'SUCCESS').length,
        failed: results.filter(r => r.status !== 'SUCCESS').length,
        totalAmount: plan.totalAmount,
        results
    };
    
    fs.writeFileSync('.cache/mainnet-execution-report.json', JSON.stringify(executionReport, null, 2));
    
    console.log(`\n📊 EXECUTION COMPLETE`);
    console.log(`   Successful: ${executionReport.successful}/${executionReport.totalTransfers}`);
    console.log(`   Failed: ${executionReport.failed}/${executionReport.totalTransfers}`);
    console.log(`   Total SOL: ${plan.totalAmount.toFixed(6)} SOL`);
    console.log(`\n📄 Report saved: .cache/mainnet-execution-report.json`);
    
    return executionReport;
}

async function getRecentBlockhash(rpcUrl) {
    const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getRecentBlockhash'
        })
    });
    
    const result = await response.json();
    return result.result?.value?.blockhash || 'PLACEHOLDER_BLOCKHASH';
}

if (require.main === module) {
    executeMainnetTransfer().catch(console.error);
}