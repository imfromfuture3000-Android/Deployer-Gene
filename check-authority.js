#!/usr/bin/env node
/**
 * Check Program Authority
 */

const { Connection, PublicKey } = require('@solana/web3.js');

async function checkAuthority() {
  console.log('🔑 CHECKING PROGRAM AUTHORITY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const yourWallet = new PublicKey('zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  
  const programs = [
    'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt',
    'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz',
    'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1'
  ];

  for (const programAddr of programs) {
    try {
      const programId = new PublicKey(programAddr);
      
      console.log(`\n📋 Program: ${programAddr}`);
      
      // Check account info
      const accountInfo = await connection.getAccountInfo(programId);
      
      if (accountInfo) {
        console.log(`👤 Owner: ${accountInfo.owner.toString()}`);
        console.log(`🔧 Executable: ${accountInfo.executable}`);
        
        // Check if it's an upgradeable program
        if (accountInfo.owner.toString() === 'BPFLoaderUpgradeab1e11111111111111111111111') {
          console.log('✅ Upgradeable program detected');
          
          // Try to find program data account
          const [programDataAddress] = PublicKey.findProgramAddressSync(
            [programId.toBuffer()],
            new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
          );
          
          try {
            const programDataInfo = await connection.getAccountInfo(programDataAddress);
            if (programDataInfo && programDataInfo.data.length > 45) {
              // Parse upgrade authority (bytes 13-45)
              const upgradeAuthorityBytes = programDataInfo.data.slice(13, 45);
              const upgradeAuthority = new PublicKey(upgradeAuthorityBytes);
              
              console.log(`🔑 Upgrade Authority: ${upgradeAuthority.toString()}`);
              
              if (upgradeAuthority.equals(yourWallet)) {
                console.log('✅ YOU HAVE UPGRADE AUTHORITY!');
              } else {
                console.log('❌ You do not have upgrade authority');
              }
            }
          } catch (e) {
            console.log('⚠️ Could not check upgrade authority');
          }
        }
        
        // Check if you're the owner of a token account
        if (accountInfo.owner.toString() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
          console.log('📊 This is a token account');
          
          if (accountInfo.data.length >= 72) {
            // Parse token account owner (bytes 32-64)
            const tokenOwner = new PublicKey(accountInfo.data.slice(32, 64));
            console.log(`👤 Token Owner: ${tokenOwner.toString()}`);
            
            if (tokenOwner.equals(yourWallet)) {
              console.log('✅ YOU OWN THIS TOKEN ACCOUNT!');
            } else {
              console.log('❌ You do not own this token account');
            }
          }
        }
        
      } else {
        console.log('❌ Account not found');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

checkAuthority();