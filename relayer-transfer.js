#!/usr/bin/env node

const fs = require('fs');

async function executeRelayerTransfer() {
    console.log('🚀 EXECUTING RELAYER-BASED SOL TRANSFER');
    console.log('💡 Using relayer for zero-cost deployment operations');
    
    const plan = JSON.parse(fs.readFileSync('.cache/sol-transfer-plan.json', 'utf8'));
    const RELAYER_URL = process.env.RELAYER_URL || 'https://relayer.mainnet.solana.com/relay';
    
    console.log(`\n🌐 Relayer URL: ${RELAYER_URL}`);
    console.log(`💰 Total SOL to transfer: ${plan.totalAmount.toFixed(6)} SOL`);
    console.log(`🎯 Target: ${plan.deployer}`);
    
    const relayerPayload = {
        method: 'batch_sol_transfer',
        network: 'mainnet-beta',
        timestamp: new Date().toISOString(),
        transfers: plan.transfers.map(t => ({
            from: t.from,
            to: t.to,
            lamports: t.lamports,
            instruction_type: 'system_transfer'
        })),
        fee_payer: process.env.RELAYER_PUBKEY || 'RELAYER_FEE_PAYER',
        total_amount: plan.totalAmount
    };
    
    console.log(`\n📦 Relayer Payload:`);
    console.log(`   Transfers: ${relayerPayload.transfers.length}`);
    console.log(`   Fee Payer: ${relayerPayload.fee_payer}`);
    
    try {
        // Submit to relayer
        console.log(`\n🔄 Submitting to relayer...`);
        
        const response = await fetch(RELAYER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RELAYER_API_KEY || 'API_KEY_REQUIRED'}`
            },
            body: JSON.stringify(relayerPayload)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log(`\n✅ RELAYER SUCCESS`);
            console.log(`   Transaction ID: ${result.transaction_id}`);
            console.log(`   Signatures: ${result.signatures?.length || 0}`);
            
            if (result.signatures) {
                result.signatures.forEach((sig, i) => {
                    console.log(`   🔗 TX ${i + 1}: https://explorer.solana.com/tx/${sig}`);
                });
            }
            
            // Save success report
            const successReport = {
                timestamp: new Date().toISOString(),
                status: 'SUCCESS',
                method: 'relayer_transfer',
                transaction_id: result.transaction_id,
                signatures: result.signatures,
                total_amount: plan.totalAmount,
                transfers_completed: relayerPayload.transfers.length
            };
            
            fs.writeFileSync('.cache/relayer-success.json', JSON.stringify(successReport, null, 2));
            console.log(`\n📄 Success report: .cache/relayer-success.json`);
            
        } else {
            console.log(`\n⚠️  RELAYER RESPONSE:`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Message: ${result.message || 'No message'}`);
            
            // Create manual instructions
            console.log(`\n📋 MANUAL TRANSFER INSTRUCTIONS:`);
            console.log(`   1. Configure relayer endpoint in .env`);
            console.log(`   2. Set RELAYER_API_KEY for authentication`);
            console.log(`   3. Ensure relayer has sufficient SOL for fees`);
            
            const manualInstructions = {
                timestamp: new Date().toISOString(),
                status: 'MANUAL_REQUIRED',
                reason: 'Relayer not configured or unavailable',
                instructions: [
                    'Set RELAYER_URL in environment',
                    'Set RELAYER_API_KEY for authentication',
                    'Ensure relayer has fee payment capability',
                    'Execute transfers via configured relayer'
                ],
                transfers: plan.transfers,
                total_amount: plan.totalAmount
            };
            
            fs.writeFileSync('.cache/manual-instructions.json', JSON.stringify(manualInstructions, null, 2));
            console.log(`\n📄 Manual instructions: .cache/manual-instructions.json`);
        }
        
    } catch (error) {
        console.log(`\n❌ RELAYER ERROR: ${error.message}`);
        
        // Fallback: Create signed transaction templates
        console.log(`\n🔧 Creating transaction templates...`);
        
        const templates = plan.transfers.map((transfer, i) => ({
            id: i + 1,
            from: transfer.from,
            to: transfer.to,
            lamports: transfer.lamports,
            sol_amount: transfer.solAmount,
            instruction: {
                program_id: '11111111111111111111111111111111',
                accounts: [
                    { pubkey: transfer.from, is_signer: true, is_writable: true },
                    { pubkey: transfer.to, is_signer: false, is_writable: true }
                ],
                data: `transfer_${transfer.lamports}_lamports`
            },
            explorer_after_execution: `https://explorer.solana.com/address/${transfer.to}`
        }));
        
        const templateReport = {
            timestamp: new Date().toISOString(),
            status: 'TEMPLATES_CREATED',
            total_transfers: templates.length,
            total_amount: plan.totalAmount,
            templates,
            note: 'Use these templates with proper transaction signing'
        };
        
        fs.writeFileSync('.cache/transaction-templates.json', JSON.stringify(templateReport, null, 2));
        console.log(`\n📄 Templates: .cache/transaction-templates.json`);
    }
    
    console.log(`\n🎯 NEXT STEPS:`);
    console.log(`   1. Configure relayer in .env file`);
    console.log(`   2. Ensure RELAYER_PUBKEY has fee payment capability`);
    console.log(`   3. Re-run with proper relayer configuration`);
    console.log(`   4. Monitor transactions on Solana Explorer`);
}

if (require.main === module) {
    executeRelayerTransfer().catch(console.error);
}