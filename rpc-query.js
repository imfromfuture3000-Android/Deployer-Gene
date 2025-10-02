const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

async function queryRpc() {
  const rpcUrl = process.env.HELIUS_API_KEY 
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    : process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
  
  const connection = new Connection(rpcUrl, 'confirmed');

  // Query program accounts like your curl example
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: '1',
      method: 'getProgramAccountsV2',
      params: [
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        { encoding: 'base64', limit: 10 }
      ]
    })
  });

  const data = await response.json();
  console.log('Token Program Accounts:', data.result?.length || 0);
  
  // Check specific program ID from your first response
  const programId = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
  try {
    const accountInfo = await connection.getAccountInfo(new PublicKey(programId));
    console.log(`Program ${programId}:`, accountInfo ? 'Found' : 'Not found');
  } catch (e) {
    console.log(`Program ${programId}: Invalid or not found`);
  }
}

queryRpc().catch(console.error);