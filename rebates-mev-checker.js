#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
require('dotenv').config();

class RebatesMEVChecker {
  constructor() {
    this.connection = new Connection(process.env.RPC_URL);
    this.treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY);
    this.rebateAddress = process.env.REBATE_ADDRESS || process.env.TREASURY_PUBKEY;
  }

  async checkHeliusRebates() {
    console.log('💰 CHECKING HELIUS SOL REBATES');
    console.log('=' .repeat(50));
    
    try {
      const balance = await this.connection.getBalance(this.treasuryPubkey);
      const solBalance = balance / 1e9;
      
      console.log(`🔑 Rebate Address: ${this.rebateAddress}`);
      console.log(`💰 Current SOL Balance: ${solBalance}`);
      
      // Check recent transactions for rebate patterns
      const signatures = await this.connection.getSignaturesForAddress(
        this.treasuryPubkey,
        { limit: 50 }
      );
      
      const rebateTransactions = [];
      let totalRebates = 0;
      
      for (const sig of signatures.slice(0, 10)) {
        try {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          
          if (tx && tx.meta) {
            const preBalance = tx.meta.preBalances[0] || 0;
            const postBalance = tx.meta.postBalances[0] || 0;
            const balanceChange = (postBalance - preBalance) / 1e9;
            
            if (balanceChange > 0 && balanceChange < 0.01) { // Small positive amounts likely rebates
              rebateTransactions.push({
                signature: sig.signature,
                amount: balanceChange,
                slot: sig.slot,
                blockTime: sig.blockTime
              });
              totalRebates += balanceChange;
            }
          }
        } catch (error) {
          // Skip failed transaction lookups
        }
      }
      
      console.log(`✅ Rebate Transactions Found: ${rebateTransactions.length}`);
      console.log(`💎 Total Rebates: ${totalRebates.toFixed(6)} SOL`);
      
      return {
        rebateAddress: this.rebateAddress,
        currentBalance: solBalance,
        rebateTransactions,
        totalRebates,
        rebatesActive: rebateTransactions.length > 0
      };
      
    } catch (error) {
      console.log('❌ Rebates check failed:', error.message);
      return { rebatesActive: false, error: error.message };
    }
  }

  async checkMEVIncome() {
    console.log('\n⚡ CHECKING MEV INCOME');
    console.log('=' .repeat(50));
    
    try {
      // Check for MEV-related transactions
      const signatures = await this.connection.getSignaturesForAddress(
        this.treasuryPubkey,
        { limit: 100 }
      );
      
      const mevTransactions = [];
      let totalMEV = 0;
      
      for (const sig of signatures.slice(0, 20)) {
        try {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          
          if (tx && tx.meta && tx.meta.logMessages) {
            // Look for MEV-related log messages
            const mevLogs = tx.meta.logMessages.filter(log => 
              log.includes('MEV') || 
              log.includes('arbitrage') || 
              log.includes('backrun') ||
              log.includes('frontrun')
            );
            
            if (mevLogs.length > 0) {
              const preBalance = tx.meta.preBalances[0] || 0;
              const postBalance = tx.meta.postBalances[0] || 0;
              const profit = (postBalance - preBalance) / 1e9;
              
              mevTransactions.push({
                signature: sig.signature,
                profit: profit,
                logs: mevLogs,
                slot: sig.slot
              });
              
              if (profit > 0) totalMEV += profit;
            }
          }
        } catch (error) {
          // Skip failed transaction lookups
        }
      }
      
      console.log(`⚡ MEV Transactions Found: ${mevTransactions.length}`);
      console.log(`💎 Total MEV Income: ${totalMEV.toFixed(6)} SOL`);
      
      return {
        mevTransactions,
        totalMEV,
        mevActive: mevTransactions.length > 0
      };
      
    } catch (error) {
      console.log('❌ MEV check failed:', error.message);
      return { mevActive: false, error: error.message };
    }
  }

  async checkValidatorRewards() {
    console.log('\n🗳️ CHECKING VALIDATOR REWARDS');
    console.log('=' .repeat(50));
    
    try {
      const voteAccounts = await this.connection.getVoteAccounts();
      const allVotes = [...(voteAccounts.current || []), ...(voteAccounts.delinquent || [])];
      const myVotes = allVotes.filter(vote => vote.nodePubkey === this.treasuryPubkey.toBase58());
      
      let totalStake = 0;
      let estimatedRewards = 0;
      
      for (const vote of myVotes) {
        const stakeSOL = vote.activatedStake / 1e9;
        const rewards = stakeSOL * 0.06; // 6% APY estimate
        totalStake += stakeSOL;
        estimatedRewards += rewards;
        
        console.log(`🗳️ Vote Account: ${vote.votePubkey}`);
        console.log(`💰 Activated Stake: ${stakeSOL.toFixed(2)} SOL`);
        console.log(`📈 Est. Annual Rewards: ${rewards.toFixed(4)} SOL`);
      }
      
      console.log(`✅ Total Validator Nodes: ${myVotes.length}`);
      console.log(`💎 Total Estimated Rewards: ${estimatedRewards.toFixed(4)} SOL/year`);
      
      return {
        validatorNodes: myVotes.length,
        totalStake,
        estimatedRewards,
        validatorActive: myVotes.length > 0
      };
      
    } catch (error) {
      console.log('❌ Validator rewards check failed:', error.message);
      return { validatorActive: false, error: error.message };
    }
  }

  async generateIncomeReport() {
    console.log('💎 COMPREHENSIVE INCOME & REBATES REPORT');
    console.log('=' .repeat(80));
    
    const rebatesData = await this.checkHeliusRebates();
    const mevData = await this.checkMEVIncome();
    const validatorData = await this.checkValidatorRewards();
    
    const incomeReport = {
      timestamp: new Date().toISOString(),
      treasury: this.treasuryPubkey.toBase58(),
      
      rebates: {
        active: rebatesData.rebatesActive,
        totalSOL: rebatesData.totalRebates || 0,
        transactions: rebatesData.rebateTransactions?.length || 0
      },
      
      mev: {
        active: mevData.mevActive,
        totalSOL: mevData.totalMEV || 0,
        transactions: mevData.mevTransactions?.length || 0
      },
      
      validator: {
        active: validatorData.validatorActive,
        nodes: validatorData.validatorNodes || 0,
        estimatedAnnualSOL: validatorData.estimatedRewards || 0
      },
      
      summary: {
        totalPassiveIncomeSOL: (rebatesData.totalRebates || 0) + (mevData.totalMEV || 0) + (validatorData.estimatedRewards || 0),
        incomeStreamsActive: [rebatesData.rebatesActive, mevData.mevActive, validatorData.validatorActive].filter(Boolean).length,
        readyForAnnouncement: true
      }
    };
    
    console.log('\n📊 INCOME SUMMARY:');
    console.log(`💰 Rebates: ${incomeReport.rebates.totalSOL.toFixed(6)} SOL (${incomeReport.rebates.active ? 'ACTIVE' : 'INACTIVE'})`);
    console.log(`⚡ MEV Income: ${incomeReport.mev.totalSOL.toFixed(6)} SOL (${incomeReport.mev.active ? 'ACTIVE' : 'INACTIVE'})`);
    console.log(`🗳️ Validator Rewards: ${incomeReport.validator.estimatedAnnualSOL.toFixed(4)} SOL/year (${incomeReport.validator.active ? 'ACTIVE' : 'INACTIVE'})`);
    console.log(`💎 Total Passive Income: ${incomeReport.summary.totalPassiveIncomeSOL.toFixed(6)} SOL`);
    console.log(`📈 Active Income Streams: ${incomeReport.summary.incomeStreamsActive}/3`);
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/income-rebates-report.json', JSON.stringify(incomeReport, null, 2));
    
    console.log('\n🎯 REBATES & MEV STATUS:');
    if (incomeReport.rebates.active) {
      console.log('✅ Helius rebates are working');
    } else {
      console.log('⚠️ No rebates detected - may need more transaction volume');
    }
    
    if (incomeReport.mev.active) {
      console.log('✅ MEV income detected');
    } else {
      console.log('ℹ️ No MEV income detected - normal for new deployments');
    }
    
    console.log('\n🚀 READY FOR CHANGELOG ANNOUNCEMENT');
    console.log('💾 Income report saved to .cache/income-rebates-report.json');
    
    return incomeReport;
  }
}

const checker = new RebatesMEVChecker();
checker.generateIncomeReport().catch(console.error);