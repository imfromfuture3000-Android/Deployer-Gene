#!/usr/bin/env node

const fs = require('fs');

async function processFirst10Addresses() {
    console.log('🔍 Processing first 10 addresses for ownership analysis...');
    
    // Load addresses from scan
    const scanData = JSON.parse(fs.readFileSync('.cache/contract-address-scan.json', 'utf8'));
    const addresses = Array.from(scanData.addressAnalysis.unknown).slice(0, 10);
    
    const results = [];
    
    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        console.log(`\n📋 Address ${i + 1}/10: ${address}`);
        
        try {
            // Simple RPC call using fetch
            const response = await fetch(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getAccountInfo',
                    params: [address, { encoding: 'base64' }]
                })
            });
            
            const data = await response.json();
            
            if (data.result?.value) {
                const account = data.result.value;
                results.push({
                    address,
                    owner: account.owner,
                    executable: account.executable,
                    lamports: account.lamports,
                    dataLength: account.data[0] ? Buffer.from(account.data[0], 'base64').length : 0
                });
                
                console.log(`   ✅ Owner: ${account.owner}`);
                console.log(`   💰 Lamports: ${account.lamports}`);
                console.log(`   📊 Data Length: ${account.data[0] ? Buffer.from(account.data[0], 'base64').length : 0}`);
            } else {
                results.push({ address, status: 'NOT_FOUND' });
                console.log(`   ❌ Account not found`);
            }
        } catch (error) {
            results.push({ address, error: error.message });
            console.log(`   ⚠️ Error: ${error.message}`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Save results
    const outputPath = '.cache/ownership-batch-1.json';
    fs.writeFileSync(outputPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        batch: 1,
        processed: results.length,
        results
    }, null, 2));
    
    console.log(`\n📄 Results saved to: ${outputPath}`);
    console.log(`📊 Summary: ${results.length} addresses processed`);
    
    return results;
}

if (require.main === module) {
    processFirst10Addresses().catch(console.error);
}