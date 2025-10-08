#!/usr/bin/env node

const fs = require('fs');

async function scanAuthorities() {
    console.log('🔍 Scanning for program authorities...');
    
    const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    const programs = [
        'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt', // Upgradeable program
        'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1'  // Standard program
    ];
    
    const authorities = {
        timestamp: new Date().toISOString(),
        programs: []
    };
    
    for (const program of programs) {
        console.log(`\n📋 Scanning: ${program}`);
        
        try {
            // Get program account info
            const response = await fetch(RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getAccountInfo',
                    params: [program, { encoding: 'base64' }]
                })
            });
            
            const data = await response.json();
            
            if (data.result?.value) {
                const account = data.result.value;
                console.log(`   Owner: ${account.owner}`);
                
                if (account.owner === 'BPFLoaderUpgradeab1e11111111111111111111111') {
                    // Get program data account for upgradeable program
                    const programDataResponse = await fetch(RPC_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 1,
                            method: 'getProgramAccounts',
                            params: [
                                'BPFLoaderUpgradeab1e11111111111111111111111',
                                {
                                    filters: [
                                        { memcmp: { offset: 4, bytes: program } }
                                    ]
                                }
                            ]
                        })
                    });
                    
                    const programData = await programDataResponse.json();
                    
                    if (programData.result?.[0]) {
                        const programDataAccount = programData.result[0];
                        console.log(`   ✅ Program Data Account: ${programDataAccount.pubkey}`);
                        
                        // Extract upgrade authority from program data
                        const dataBuffer = Buffer.from(programDataAccount.account.data[0], 'base64');
                        if (dataBuffer.length >= 45) {
                            const upgradeAuthority = dataBuffer.slice(13, 45).toString('base64');
                            console.log(`   🔑 Upgrade Authority: ${upgradeAuthority}`);
                            
                            authorities.programs.push({
                                program,
                                type: 'UPGRADEABLE',
                                programDataAccount: programDataAccount.pubkey,
                                upgradeAuthority,
                                keyRequired: 'UPGRADE_AUTHORITY_KEY'
                            });
                        }
                    }
                    
                } else if (account.owner === 'BPFLoader2111111111111111111111111111111111') {
                    console.log(`   ✅ Standard Program`);
                    console.log(`   🔑 Program Authority: ${program} (self-owned)`);
                    
                    authorities.programs.push({
                        program,
                        type: 'STANDARD',
                        programAuthority: program,
                        keyRequired: 'PROGRAM_AUTHORITY_KEY'
                    });
                }
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    fs.writeFileSync('.cache/authorities-scan.json', JSON.stringify(authorities, null, 2));
    
    console.log(`\n📊 Authority Scan Results:`);
    console.log(`   Programs Scanned: ${authorities.programs.length}`);
    
    authorities.programs.forEach(prog => {
        console.log(`\n   Program: ${prog.program}`);
        console.log(`   Type: ${prog.type}`);
        console.log(`   Key Required: ${prog.keyRequired}`);
        if (prog.upgradeAuthority) {
            console.log(`   Authority: ${prog.upgradeAuthority}`);
        }
    });
    
    // Create .env with found authorities
    let envContent = '# Program Authorities Found\n\n';
    
    authorities.programs.forEach(prog => {
        envContent += `# ${prog.type} Program: ${prog.program}\n`;
        envContent += `${prog.keyRequired}=<private_key_base58>\n\n`;
    });
    
    envContent += `# Relayer Configuration\n`;
    envContent += `RELAYER_URL=https://your-relayer.com/relay\n`;
    envContent += `RELAYER_API_KEY=<your_api_key>\n`;
    
    fs.writeFileSync('.env.authorities', envContent);
    
    console.log(`\n📄 Files created:`);
    console.log(`   .cache/authorities-scan.json - Scan results`);
    console.log(`   .env.authorities - Environment template`);
    
    return authorities;
}

if (require.main === module) {
    scanAuthorities().catch(console.error);
}