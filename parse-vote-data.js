#!/usr/bin/env node
/**
 * Parse Vote Account Data
 */

const voteData = `{"jsonrpc":"2.0","result":{"current":[{"activatedStake":133067670177820,"commission":0,"epochCredits":[[855,1083068113,1076160497],[856,1089970033,1083068113],[857,1096870488,1089970033],[858,1103775086,1096870488],[859,1105027721,1103775086]],"epochVoteAccount":true,"lastVote":371166386,"nodePubkey":"6k1YkmTKwPRUhChnxA9ryJmbtuQMbro4xFTL6mL9jycB","rootSlot":371166355,"votePubkey":"91413b9eEvG6UofpSgwdUgH9Lz4QBF1G3J325Bw7JwGR"}]}}`;

function parseVoteAccounts() {
  console.log('🗳️ PARSING VOTE ACCOUNT DATA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const data = JSON.parse(voteData);
    const voteAccounts = data.result.current;
    
    console.log(`✅ Found ${voteAccounts.length} vote accounts in data`);
    
    // Check for your wallet
    const yourWallet = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
    
    let yourAccounts = voteAccounts.filter(vote => 
      vote.nodePubkey === yourWallet
    );
    
    if (yourAccounts.length > 0) {
      console.log(`\n✅ YOU HAVE ${yourAccounts.length} VOTE ACCOUNT(S):`);
      yourAccounts.forEach(vote => {
        console.log(`Vote: ${vote.votePubkey}`);
        console.log(`Node: ${vote.nodePubkey}`);
        console.log(`Stake: ${(vote.activatedStake / 1e9).toFixed(2)} SOL`);
        console.log(`Commission: ${vote.commission}%`);
      });
    } else {
      console.log('❌ Your wallet not found in vote accounts');
    }
    
    // Show top validators by stake
    console.log('\n🏆 TOP 10 VALIDATORS BY STAKE:');
    voteAccounts
      .sort((a, b) => b.activatedStake - a.activatedStake)
      .slice(0, 10)
      .forEach((vote, i) => {
        const stakeSOL = (vote.activatedStake / 1e9).toFixed(0);
        console.log(`${i + 1}. ${vote.nodePubkey.slice(0, 8)}... - ${stakeSOL} SOL (${vote.commission}%)`);
      });
    
  } catch (error) {
    console.log(`❌ Error parsing data: ${error.message}`);
  }
}

parseVoteAccounts();