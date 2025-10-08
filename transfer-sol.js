#!/usr/bin/env node

const fs = require('fs');

async function transferSOL() {
    console.log('💰 Transferring SOL to main deployer address...');
    
    const DEPLOYER_ADDRESS = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
    const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    // Load found accounts
    const batch1 = JSON.parse(fs.readFileSync('.cache/ownership-batch-1.json', 'utf8'));
    const accounts = batch1.results.filter(r => r.lamports && r.lamports > 5000); // Min rent exempt
    
    console.log(`\n🔍 Found ${accounts.length} accounts with SOL:`);
    
    let totalSOL = 0;
    const transfers = [];
    
    for (const account of accounts) {
        const solAmount = account.lamports / 1e9;
        totalSOL += solAmount;
        
        console.log(`   📋 ${account.address}: ${solAmount.toFixed(6)} SOL`);
        
        // Create transfer instruction (simulation)
        const transferAmount = account.lamports - 890880; // Keep rent exempt amount
        
        if (transferAmount > 0) {
            transfers.push({
                from: account.address,
                to: DEPLOYER_ADDRESS,
                lamports: transferAmount,
                solAmount: transferAmount / 1e9
            });
        }
    }
    
    console.log(`\n💎 Total SOL available: ${totalSOL.toFixed(6)} SOL`);
    console.log(`🎯 Transferable SOL: ${transfers.reduce((sum, t) => sum + t.solAmount, 0).toFixed(6)} SOL`);
    
    // Create relayer transaction payload
    const relayerPayload = {
        timestamp: new Date().toISOString(),
        action: 'sol_consolidation',
        deployer: DEPLOYER_ADDRESS,
        transfers: transfers,
        totalAmount: transfers.reduce((sum, t) => sum + t.solAmount, 0),
        method: 'relayer_batch_transfer'
    };
    
    // Save transfer plan
    fs.writeFileSync('.cache/sol-transfer-plan.json', JSON.stringify(relayerPayload, null, 2));
    
    console.log(`\n📄 Transfer plan saved to: .cache/sol-transfer-plan.json`);
    
    // Simulate relayer call
    if (process.env.DRY_RUN !== 'false') {
        console.log('\n🌙 DRY RUN MODE - Simulating transfers...');
        
        for (const transfer of transfers) {
            console.log(`   🔄 ${transfer.from} → ${DEPLOYER_ADDRESS}`);
            console.log(`      Amount: ${transfer.solAmount.toFixed(6)} SOL`);
        }
        
        console.log('\n✅ Simulation complete. Set DRY_RUN=false to execute.');
    } else {
        console.log('\n🚀 LIVE MODE - Would execute via relayer...');
        console.log('⚠️  Relayer integration required for actual execution');
    }
    
    return relayerPayload;
}

if (require.main === module) {
    transferSOL().catch(console.error);
}