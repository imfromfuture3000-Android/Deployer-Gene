#!/usr/bin/env node

const fs = require('fs');

async function checkOnWeb() {
    console.log('🌐 Checking transactions on Solana Explorer...');
    
    const realTransfer = JSON.parse(fs.readFileSync('.cache/real-transfer-executed.json', 'utf8'));
    const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    console.log(`🎯 Destination: ${realTransfer.destination}`);
    console.log(`💰 Expected Total: ${realTransfer.totalAmount.toFixed(6)} SOL`);
    
    const webCheck = {
        timestamp: new Date().toISOString(),
        destination: realTransfer.destination,
        checks: []
    };
    
    // Check destination balance
    try {
        console.log(`\n📋 Checking destination balance...`);
        
        const balanceResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getBalance',
                params: [realTransfer.destination]
            })
        });
        
        const balanceData = await balanceResponse.json();
        const balance = balanceData.result?.value || 0;
        
        console.log(`   💰 Current Balance: ${(balance / 1e9).toFixed(6)} SOL`);
        
        webCheck.destinationBalance = {
            lamports: balance,
            sol: balance / 1e9,
            status: balance > 0 ? 'HAS_FUNDS' : 'EMPTY'
        };
        
    } catch (error) {
        console.log(`   ⚠️ Balance check error: ${error.message}`);
    }
    
    // Check each transaction
    for (const transfer of realTransfer.transfers) {
        console.log(`\n📋 Checking TX: ${transfer.txHash}`);
        
        try {
            const txResponse = await fetch(RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTransaction',
                    params: [transfer.txHash, { encoding: 'json' }]
                })
            });
            
            const txData = await txResponse.json();
            
            if (txData.result) {
                console.log(`   ✅ CONFIRMED - Slot: ${txData.result.slot}`);
                console.log(`   🔗 Explorer: ${transfer.explorer}`);
                
                webCheck.checks.push({
                    txHash: transfer.txHash,
                    status: 'CONFIRMED',
                    slot: txData.result.slot,
                    explorer: transfer.explorer,
                    amount: transfer.solAmount
                });
            } else {
                console.log(`   ⏳ PENDING or NOT FOUND`);
                console.log(`   🔗 Check: ${transfer.explorer}`);
                
                webCheck.checks.push({
                    txHash: transfer.txHash,
                    status: 'PENDING',
                    explorer: transfer.explorer,
                    amount: transfer.solAmount
                });
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            
            webCheck.checks.push({
                txHash: transfer.txHash,
                status: 'ERROR',
                error: error.message,
                explorer: transfer.explorer,
                amount: transfer.solAmount
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    fs.writeFileSync('.cache/web-check-results.json', JSON.stringify(webCheck, null, 2));
    
    console.log(`\n📊 Web Check Summary:`);
    console.log(`   Destination Balance: ${webCheck.destinationBalance?.sol?.toFixed(6) || 'Unknown'} SOL`);
    console.log(`   Confirmed TXs: ${webCheck.checks.filter(c => c.status === 'CONFIRMED').length}/${webCheck.checks.length}`);
    console.log(`   Pending TXs: ${webCheck.checks.filter(c => c.status === 'PENDING').length}/${webCheck.checks.length}`);
    
    console.log(`\n🌐 Explorer Links:`);
    webCheck.checks.forEach((check, i) => {
        console.log(`   TX ${i + 1}: ${check.explorer}`);
    });
    
    console.log(`\n📄 Results: .cache/web-check-results.json`);
    
    return webCheck;
}

if (require.main === module) {
    checkOnWeb().catch(console.error);
}