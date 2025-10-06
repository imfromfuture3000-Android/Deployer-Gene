const { Connection, PublicKey } = require('@solana/web3.js');

exports.handler = async (event) => {
    console.log('🚀 AWS Lambda: Omega Deployer Triggered');
    
    try {
        const connection = new Connection(process.env.RPC_URL);
        const genesisHash = await connection.getGenesisHash();
        
        if (genesisHash !== '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d') {
            throw new Error('NOT MAINNET');
        }
        
        const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY);
        const balance = await connection.getBalance(treasuryPubkey);
        
        const response = {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'success',
                network: 'mainnet-beta',
                genesisHash,
                treasuryBalance: balance / 1e9,
                timestamp: new Date().toISOString(),
                provider: 'aws-lambda'
            })
        };
        
        console.log('✅ AWS Lambda: Deployment Status Retrieved');
        return response;
        
    } catch (error) {
        console.error('❌ AWS Lambda Error:', error.message);
        
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message })
        };
    }
};