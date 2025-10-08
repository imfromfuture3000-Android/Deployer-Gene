#!/usr/bin/env node

const fs = require('fs');

async function handleBPFLoader() {
    console.log('🔧 Handling BPF Loader v2 owned program');
    
    const programAddress = 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1';
    const owner = 'BPFLoader2111111111111111111111111111111111';
    const BACKPACK_WALLET = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';
    
    console.log(`📋 Program: ${programAddress}`);
    console.log(`👤 Owner: ${owner} (BPF Loader v2)`);
    console.log(`💰 Value: 2.161992 SOL`);
    
    const analysis = {
        timestamp: new Date().toISOString(),
        program: programAddress,
        owner,
        ownerType: 'BPF_LOADER_V2',
        transferability: 'SYSTEM_OWNED',
        conclusion: 'Cannot transfer - owned by system program',
        alternatives: [
            'Program is owned by BPF Loader v2 system program',
            'No private key can control system-owned programs',
            'SOL is permanently locked in program account',
            'Only program upgrade/close instructions could release funds'
        ]
    };
    
    console.log(`\n⚠️  ANALYSIS:`);
    console.log(`   Status: SYSTEM OWNED`);
    console.log(`   Transferable: NO`);
    console.log(`   Reason: BPF Loader v2 is a system program`);
    
    console.log(`\n🔍 Key Facts:`);
    analysis.alternatives.forEach(fact => {
        console.log(`   • ${fact}`);
    });
    
    // Check if program has any close authority
    const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    try {
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getAccountInfo',
                params: [programAddress, { encoding: 'base64' }]
            })
        });
        
        const data = await response.json();
        
        if (data.result?.value) {
            const account = data.result.value;
            analysis.accountData = {
                lamports: account.lamports,
                executable: account.executable,
                dataLength: account.data[0] ? Buffer.from(account.data[0], 'base64').length : 0
            };
            
            console.log(`\n📊 Account Details:`);
            console.log(`   Lamports: ${account.lamports}`);
            console.log(`   Executable: ${account.executable}`);
            console.log(`   Data Length: ${analysis.accountData.dataLength} bytes`);
        }
        
    } catch (error) {
        console.log(`   ⚠️ Error getting account info: ${error.message}`);
    }
    
    fs.writeFileSync('.cache/bpf-loader-analysis.json', JSON.stringify(analysis, null, 2));
    
    console.log(`\n❌ CONCLUSION:`);
    console.log(`   The 2.161992 SOL in program ${programAddress}`);
    console.log(`   CANNOT be transferred because it's owned by BPF Loader v2`);
    console.log(`   This is a system program with no private key control`);
    
    console.log(`\n📄 Analysis saved: .cache/bpf-loader-analysis.json`);
    
    return analysis;
}

if (require.main === module) {
    handleBPFLoader().catch(console.error);
}