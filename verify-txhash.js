#!/usr/bin/env node

const fs = require('fs');

async function verifyTxHashes() {
    console.log('🔍 Verifying transaction hashes...');
    
    const evmData = JSON.parse(fs.readFileSync('.cache/evm-token-transfers.json', 'utf8'));
    const results = [];
    
    for (const tx of evmData.results) {
        console.log(`\n📋 Checking ${tx.network}: ${tx.txHash}`);
        
        try {
            let rpcUrl;
            switch (tx.network) {
                case 'ethereum':
                    rpcUrl = 'https://eth.llamarpc.com';
                    break;
                case 'bsc':
                    rpcUrl = 'https://bsc-dataseed.binance.org';
                    break;
                case 'polygon':
                    rpcUrl = 'https://polygon-rpc.com';
                    break;
                default:
                    rpcUrl = 'https://eth.llamarpc.com';
            }
            
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_getTransactionByHash',
                    params: [tx.txHash],
                    id: 1
                })
            });
            
            const data = await response.json();
            
            if (data.result) {
                console.log(`   ✅ REAL - Block: ${parseInt(data.result.blockNumber, 16)}`);
                console.log(`   💰 Value: ${parseInt(data.result.value, 16) / 1e18} ETH`);
                results.push({
                    ...tx,
                    verified: true,
                    onChainBlock: parseInt(data.result.blockNumber, 16),
                    onChainValue: parseInt(data.result.value, 16) / 1e18
                });
            } else {
                console.log(`   ❌ NOT FOUND`);
                results.push({
                    ...tx,
                    verified: false,
                    error: 'Transaction not found'
                });
            }
            
        } catch (error) {
            console.log(`   ⚠️ ERROR: ${error.message}`);
            results.push({
                ...tx,
                verified: false,
                error: error.message
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const verification = {
        timestamp: new Date().toISOString(),
        totalChecked: results.length,
        verified: results.filter(r => r.verified).length,
        failed: results.filter(r => !r.verified).length,
        results
    };
    
    fs.writeFileSync('.cache/tx-verification.json', JSON.stringify(verification, null, 2));
    
    console.log(`\n📊 Verification Summary:`);
    console.log(`   Verified: ${verification.verified}/${verification.totalChecked}`);
    console.log(`   Failed: ${verification.failed}/${verification.totalChecked}`);
    console.log(`\n📄 Results: .cache/tx-verification.json`);
    
    return verification;
}

if (require.main === module) {
    verifyTxHashes().catch(console.error);
}