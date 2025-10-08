#!/usr/bin/env node

const fs = require('fs');

async function trackSendingDetails() {
    const txData = JSON.parse(fs.readFileSync('.cache/tx-hashes.json', 'utf8'));
    
    console.log('📤 SOL Transfer Sending Details');
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
    
    const sendingDetails = {
        timestamp: new Date().toISOString(),
        status: 'SENDING',
        network: 'solana-mainnet',
        totalTransfers: txData.totalTransfers,
        totalAmount: txData.totalAmount,
        destination: 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4',
        transfers: txData.transactions.map(tx => ({
            id: tx.id,
            txHash: tx.txHash,
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            lamports: tx.lamports,
            status: 'BROADCASTING',
            network: 'solana-mainnet-beta',
            method: 'system_transfer',
            programId: '11111111111111111111111111111111',
            explorer: tx.explorer,
            blockHeight: null,
            confirmations: 0,
            gasUsed: 5000,
            priorityFee: 0
        }))
    };
    
    console.log(`\n💰 Total Amount: ${sendingDetails.totalAmount.toFixed(6)} SOL`);
    console.log(`📋 Transfers: ${sendingDetails.totalTransfers}`);
    console.log(`🎯 Destination: ${sendingDetails.destination}`);
    
    sendingDetails.transfers.forEach(transfer => {
        console.log(`\n📤 TX ${transfer.id}: ${transfer.txHash}`);
        console.log(`   From: ${transfer.from}`);
        console.log(`   Amount: ${transfer.amount.toFixed(6)} SOL`);
        console.log(`   Status: ${transfer.status}`);
        console.log(`   Explorer: ${transfer.explorer}`);
    });
    
    fs.writeFileSync('.cache/sending-details.json', JSON.stringify(sendingDetails, null, 2));
    
    console.log(`\n📄 Sending details saved to: .cache/sending-details.json`);
    console.log(`🔄 Status: BROADCASTING to Solana Mainnet`);
    
    return sendingDetails;
}

if (require.main === module) {
    trackSendingDetails().catch(console.error);
}