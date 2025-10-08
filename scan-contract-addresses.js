#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Solana address patterns
const SOLANA_ADDRESS_PATTERN = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
const KNOWN_PROGRAMS = {
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'Token Program',
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token Program',
    '11111111111111111111111111111111': 'System Program',
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': 'Metaplex Token Metadata',
    'So11111111111111111111111111111111111111112': 'Wrapped SOL',
    'SysvarRent111111111111111111111111111111111': 'Rent Sysvar',
    'SysvarC1ock11111111111111111111111111111111': 'Clock Sysvar'
};

function scanDirectory(dir, results = { files: [], addresses: new Set(), programs: [] }) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Skip node_modules, .git, etc.
            if (!['node_modules', '.git', '.cache', 'dist', 'build'].includes(item)) {
                scanDirectory(fullPath, results);
            }
        } else if (stat.isFile()) {
            // Scan relevant file types
            const ext = path.extname(item).toLowerCase();
            if (['.js', '.ts', '.json', '.md', '.txt', '.env', '.yml', '.yaml'].includes(ext)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const matches = content.match(SOLANA_ADDRESS_PATTERN) || [];
                    
                    if (matches.length > 0) {
                        results.files.push({
                            file: fullPath.replace(process.cwd(), '.'),
                            addresses: matches,
                            count: matches.length
                        });
                        
                        matches.forEach(addr => results.addresses.add(addr));
                    }
                } catch (error) {
                    console.log(`⚠️ Could not read ${fullPath}: ${error.message}`);
                }
            }
        }
    }
    
    return results;
}

function analyzeAddresses(addresses) {
    const analysis = {
        total: addresses.size,
        known: [],
        unknown: [],
        potential_programs: [],
        wallets: []
    };
    
    for (const addr of addresses) {
        if (KNOWN_PROGRAMS[addr]) {
            analysis.known.push({
                address: addr,
                type: KNOWN_PROGRAMS[addr]
            });
        } else {
            analysis.unknown.push(addr);
            
            // Heuristics for program vs wallet
            if (addr.length === 44 && addr.match(/^[1-9A-HJ-NP-Za-km-z]{44}$/)) {
                // Check if it looks like a program (ends with specific patterns)
                if (addr.endsWith('111111111111111') || addr.includes('Program') || addr.includes('Token')) {
                    analysis.potential_programs.push(addr);
                } else {
                    analysis.wallets.push(addr);
                }
            }
        }
    }
    
    return analysis;
}

async function scanContractAddresses() {
    console.log('🔍 Scanning all files for contract addresses...');
    
    const results = scanDirectory(process.cwd());
    const analysis = analyzeAddresses(results.addresses);
    
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            filesScanned: results.files.length,
            totalAddresses: analysis.total,
            knownPrograms: analysis.known.length,
            unknownAddresses: analysis.unknown.length,
            potentialPrograms: analysis.potential_programs.length,
            walletAddresses: analysis.wallets.length
        },
        fileDetails: results.files,
        addressAnalysis: analysis
    };
    
    // Save results
    const outputPath = path.join(process.cwd(), '.cache', 'contract-address-scan.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Contract Address Scan Results:`);
    console.log(`   Files with addresses: ${results.files.length}`);
    console.log(`   Total unique addresses: ${analysis.total}`);
    console.log(`   Known programs: ${analysis.known.length}`);
    console.log(`   Unknown addresses: ${analysis.unknown.length}`);
    console.log(`   Potential programs: ${analysis.potential_programs.length}`);
    console.log(`   Wallet addresses: ${analysis.wallets.length}`);
    
    console.log(`\n🔍 Known Programs Found:`);
    analysis.known.forEach(prog => {
        console.log(`   ✅ ${prog.address} - ${prog.type}`);
    });
    
    if (analysis.potential_programs.length > 0) {
        console.log(`\n🤔 Potential Programs:`);
        analysis.potential_programs.slice(0, 10).forEach(addr => {
            console.log(`   🔍 ${addr}`);
        });
    }
    
    console.log(`\n📄 Full report saved to: ${outputPath}`);
    
    return report;
}

if (require.main === module) {
    scanContractAddresses().catch(console.error);
}

module.exports = { scanContractAddresses };