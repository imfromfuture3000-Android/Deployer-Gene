#!/usr/bin/env node
/**
 * Fetch Helius RPC from Futuristic Repo
 */

async function fetchHeliusFromRepo() {
  console.log('🔍 FETCHING HELIUS RPC FROM FUTURISTIC REPO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const repoUrl = 'https://api.github.com/search/code?q=repo:imfromfuture3000-Android/The-Futuristic-Kami-Omni-Engine+Helius';
  
  try {
    console.log('📡 Searching GitHub for Helius configurations...');
    
    const response = await fetch(repoUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Deployer-Gene'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Found ${data.total_count} files with Helius references`);
    
    const heliusConfigs = [];
    
    for (const item of data.items) {
      console.log(`\n📄 File: ${item.name}`);
      console.log(`📁 Path: ${item.path}`);
      
      // Fetch file content
      try {
        const fileResponse = await fetch(item.url, {
          headers: {
            'Accept': 'application/vnd.github.v3.raw',
            'User-Agent': 'Deployer-Gene'
          }
        });
        
        if (fileResponse.ok) {
          const content = await fileResponse.text();
          
          // Extract Helius API keys and endpoints
          const heliusMatches = content.match(/helius[^"'\s]*['"]\s*:\s*['"](.*?)['"]/gi) ||
                               content.match(/HELIUS_API_KEY[^"'\s]*['"]\s*:\s*['"](.*?)['"]/gi) ||
                               content.match(/mainnet\.helius-rpc\.com[^"'\s]*/gi);
          
          if (heliusMatches) {
            heliusMatches.forEach(match => {
              console.log(`🔑 Found: ${match}`);
              heliusConfigs.push({
                file: item.name,
                path: item.path,
                config: match
              });
            });
          }
        }
      } catch (e) {
        console.log(`⚠️ Could not fetch content: ${e.message}`);
      }
    }
    
    if (heliusConfigs.length > 0) {
      console.log('\n🎯 HELIUS CONFIGURATIONS FOUND:');
      heliusConfigs.forEach((config, i) => {
        console.log(`${i + 1}. ${config.file}: ${config.config}`);
      });
      
      // Save configurations
      require('fs').writeFileSync('.cache/helius-configs.json', JSON.stringify(heliusConfigs, null, 2));
      console.log('💾 Saved to .cache/helius-configs.json');
    } else {
      console.log('❌ No Helius configurations found in repository');
    }
    
    return heliusConfigs;
    
  } catch (error) {
    console.log(`❌ Error fetching from GitHub: ${error.message}`);
    
    // Fallback: Use common Helius patterns
    console.log('\n💡 Using common Helius RPC patterns:');
    const fallbackConfigs = [
      'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY',
      'https://rpc.helius.xyz/?api-key=YOUR_API_KEY',
      'wss://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY'
    ];
    
    fallbackConfigs.forEach((config, i) => {
      console.log(`${i + 1}. ${config}`);
    });
    
    return fallbackConfigs;
  }
}

fetchHeliusFromRepo();