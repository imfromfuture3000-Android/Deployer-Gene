#!/usr/bin/env node
/**
 * Check Withdraw Authority via RPC
 */

const { Connection, PublicKey } = require('@solana/web3.js');

async function checkWithdrawAuthority() {
  console.log('🔍 CHECKING WITHDRAW AUTHORITY VIA RPC');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  const voteAccounts = [
    '91413b9eEvG6UofpSgwdUgH9Lz4QBF1G3J325Bw7JwGR',
    '8ty86LdqsnSW4fpbZRFaR1EfgB3eUknJVz8BKY5izoWy',
    'GFXVa1g8zzAVDRnSuB6o9PnHuyH25ADvy2YJPZLpATuP'
  ];

  for (const voteAddr of voteAccounts) {
    try {
      const votePubkey = new PublicKey(voteAddr);
      
      console.log(`\n🗳️ Vote Account: ${voteAddr}`);
      
      // Get account info
      const accountInfo = await connection.getAccountInfo(votePubkey);
      
      if (accountInfo && accountInfo.data.length >= 32) {
        // Parse vote account data to find withdraw authority
        // Withdraw authority is typically at offset 4-36 in vote account data
        const withdrawAuthorityBytes = accountInfo.data.slice(4, 36);
        const withdrawAuthority = new PublicKey(withdrawAuthorityBytes);
        
        console.log(`🔑 Withdraw Authority: ${withdrawAuthority.toString()}`);
        
        // Check if it matches your wallet
        if (withdrawAuthority.toString() === 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4') {
          console.log('✅ YOU HAVE WITHDRAW AUTHORITY!');
        } else {
          console.log('❌ You do not have withdraw authority');
        }
        
        // Get recent signatures for this account
        const signatures = await connection.getSignaturesForAddress(votePubkey, { limit: 5 });
        
        if (signatures.length > 0) {
          console.log('📋 Recent signatures:');
          signatures.slice(0, 3).forEach((sig, i) => {
            console.log(`${i + 1}. ${sig.signature}`);
          });
        }
        
      } else {
        console.log('❌ Could not parse account data');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

checkWithdrawAuthority();