const { Connection, PublicKey } = require('@solana/web3.js');

module.exports = async function (context, req) {
    context.log('🚀 Azure Function: Omega Deployer Triggered');
    
    try {
        const connection = new Connection(process.env.RPC_URL);
        const genesisHash = await connection.getGenesisHash();
        
        if (genesisHash !== '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d') {
            throw new Error('NOT MAINNET');
        }
        
        const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY);
        const balance = await connection.getBalance(treasuryPubkey);
        
        const response = {
            status: 'success',
            network: 'mainnet-beta',
            genesisHash,
            treasuryBalance: balance / 1e9,
            timestamp: new Date().toISOString(),
            provider: 'azure-function'
        };
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: response
        };
        
        context.log('✅ Azure Function: Deployment Status Retrieved');
        
    } catch (error) {
        context.log.error('❌ Azure Function Error:', error.message);
        
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { error: error.message }
        };
    }
};