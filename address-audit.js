const fs = require('fs');
const path = require('path');

// Comprehensive contract address audit script
async function auditContractAddresses() {
  console.log('🔍 COMPREHENSIVE CONTRACT ADDRESS AUDIT');
  console.log('Generated:', new Date().toISOString());
  console.log('='.repeat(60));

  const addressesFound = [];
  const fileContents = new Map();

  // Known Solana program IDs that should be kept
  const knownProgramIds = new Set([
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // SPL Token Program
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', // SPL Token-2022 Program
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Program
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', // Metaplex Token Metadata Program
    'BPFLoaderUpgradeab1e11111111111111111111111', // BPF Upgradeable Loader
    '11111111111111111111111111111111' // System Program
  ]);

  // Function to search for addresses in a file
  function searchAddressesInFile(filePath, content) {
    // Regex for Solana addresses (base58 encoded, typically 32-44 characters)
    const addressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const matches = content.match(addressRegex) || [];
    
    return matches
      .filter(match => !knownProgramIds.has(match))
      .filter(match => {
        // Additional validation for Solana addresses
        try {
          // Simple validation - Solana addresses should not contain certain chars
          return !/[0OIl]/.test(match) && match.length >= 32 && match.length <= 44;
        } catch (e) {
          return false;
        }
      });
  }

  // Function to recursively scan directory
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
          scanDirectory(filePath);
        }
      } else if (stats.isFile()) {
        // Only scan source code files
        const ext = path.extname(file);
        if (['.js', '.ts', '.json', '.md', '.env', '.sample'].includes(ext) || file === '.env') {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            fileContents.set(filePath, content);
            
            const addresses = searchAddressesInFile(filePath, content);
            if (addresses.length > 0) {
              for (const address of addresses) {
                // Get context around the address
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].includes(address)) {
                    addressesFound.push({
                      address,
                      file: filePath,
                      line: i + 1,
                      context: lines[i].trim(),
                      type: detectAddressType(address, lines[i])
                    });
                  }
                }
              }
            }
          } catch (e) {
            // Skip files that can't be read
          }
        }
      }
    }
  }

  // Function to detect address type based on context
  function detectAddressType(address, context) {
    const lowerContext = context.toLowerCase();
    
    if (lowerContext.includes('treasury') || lowerContext.includes('owner')) return 'Treasury/Owner';
    if (lowerContext.includes('mint') || lowerContext.includes('token')) return 'Token/Mint';
    if (lowerContext.includes('bot') || lowerContext.includes('stake') || lowerContext.includes('operator')) return 'Bot/Operator';
    if (lowerContext.includes('target') || lowerContext.includes('source')) return 'Wallet';
    if (lowerContext.includes('contract') || lowerContext.includes('deployer')) return 'Contract';
    if (lowerContext.includes('authority') || lowerContext.includes('controller')) return 'Authority';
    
    return 'Unknown';
  }

  // Start scanning from current directory
  scanDirectory('.');

  // Remove duplicates and group by address
  const uniqueAddresses = new Map();
  for (const item of addressesFound) {
    if (!uniqueAddresses.has(item.address)) {
      uniqueAddresses.set(item.address, []);
    }
    uniqueAddresses.get(item.address).push(item);
  }

  console.log('📊 AUDIT RESULTS:');
  console.log(`Total unique addresses found: ${uniqueAddresses.size}`);
  console.log(`Total occurrences: ${addressesFound.length}\n`);

  // Display results grouped by address
  for (const [address, occurrences] of uniqueAddresses) {
    console.log(`🔑 ADDRESS: ${address}`);
    console.log(`   Type: ${occurrences[0].type}`);
    console.log(`   Occurrences: ${occurrences.length}`);
    
    for (const occurrence of occurrences) {
      const relativePath = path.relative('.', occurrence.file);
      console.log(`     📁 ${relativePath}:${occurrence.line}`);
      console.log(`        ${occurrence.context}`);
    }
    console.log('');
  }

  // Generate removal recommendations
  console.log('🔧 REMOVAL RECOMMENDATIONS:');
  console.log('─'.repeat(40));

  const removalPlan = [];
  for (const [address, occurrences] of uniqueAddresses) {
    const files = [...new Set(occurrences.map(o => path.relative('.', o.file)))];
    
    removalPlan.push({
      address,
      type: occurrences[0].type,
      files,
      action: determineRemovalAction(occurrences[0].type, occurrences)
    });
  }

  for (const plan of removalPlan) {
    console.log(`Address: ${plan.address}`);
    console.log(`Type: ${plan.type}`);
    console.log(`Files: ${plan.files.join(', ')}`);
    console.log(`Action: ${plan.action}`);
    console.log('');
  }

  // Generate summary report
  const summary = {
    totalAddresses: uniqueAddresses.size,
    totalOccurrences: addressesFound.length,
    typeBreakdown: {},
    filesToModify: [...new Set(addressesFound.map(a => path.relative('.', a.file)))],
    removalPlan
  };

  for (const [address, occurrences] of uniqueAddresses) {
    const type = occurrences[0].type;
    summary.typeBreakdown[type] = (summary.typeBreakdown[type] || 0) + 1;
  }

  console.log('📋 SUMMARY REPORT:');
  console.log('─'.repeat(40));
  console.log(`Total addresses to remove: ${summary.totalAddresses}`);
  console.log(`Files requiring modification: ${summary.filesToModify.length}`);
  console.log('Address types:');
  for (const [type, count] of Object.entries(summary.typeBreakdown)) {
    console.log(`  ${type}: ${count}`);
  }

  // Save detailed report to file
  fs.writeFileSync('address-audit-report.json', JSON.stringify(summary, null, 2));
  console.log('\n✅ Detailed report saved to address-audit-report.json');

  return summary;
}

function determineRemovalAction(type, occurrences) {
  switch (type) {
    case 'Bot/Operator':
      return 'REMOVE - Delete hardcoded bot addresses';
    case 'Treasury/Owner':
      return 'REPLACE - Use environment variables instead';
    case 'Token/Mint':
      return 'REMOVE - Delete hardcoded token addresses';
    case 'Wallet':
      return 'REPLACE - Use environment variables instead';
    case 'Contract':
      return 'REMOVE - Delete hardcoded contract addresses';
    case 'Authority':
      return 'REPLACE - Use environment variables instead';
    default:
      return 'REVIEW - Manual review required';
  }
}

if (require.main === module) {
  auditContractAddresses().catch(console.error);
}

module.exports = { auditContractAddresses };