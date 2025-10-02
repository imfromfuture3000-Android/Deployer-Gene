import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { getRandomTipAccount, calculateOptimalTip, TIP_ACCOUNT_CONFIG } from './tipAccount';

export interface RebateConfig {
  enabled: boolean;
  tipAccount: PublicKey;
  tipAmount: number;
  rebatePercentage: number;
}

export class HeliusRebateManager {
  private connection: Connection;
  private rebateConfig: RebateConfig;

  constructor(connection: Connection) {
    this.connection = connection;
    this.rebateConfig = {
      enabled: process.env.HELIUS_REBATES_ENABLED === 'true',
      tipAccount: getRandomTipAccount(),
      tipAmount: TIP_ACCOUNT_CONFIG.DEFAULT_TIP_LAMPORTS,
      rebatePercentage: TIP_ACCOUNT_CONFIG.REBATE_BPS / 10000
    };
  }

  public addTipInstruction(transaction: Transaction, customTipAmount?: number): Transaction {
    if (!this.rebateConfig.enabled) return transaction;

    const tipAmount = customTipAmount || calculateOptimalTip(transaction.instructions.length);
    
    const tipInstruction = SystemProgram.transfer({
      fromPubkey: transaction.feePayer!,
      toPubkey: this.rebateConfig.tipAccount,
      lamports: tipAmount
    });

    // Add tip as first instruction for priority
    transaction.instructions.unshift(tipInstruction);
    return transaction;
  }

  public async estimateRebate(transactionCost: number): Promise<number> {
    if (!this.rebateConfig.enabled) return 0;
    return transactionCost * this.rebateConfig.rebatePercentage;
  }

  public getOptimalTipForTransaction(instructions: TransactionInstruction[]): number {
    const complexity = instructions.reduce((acc, ix) => acc + ix.data.length, 0);
    return calculateOptimalTip(complexity);
  }

  public rotateTipAccount(): void {
    this.rebateConfig.tipAccount = getRandomTipAccount();
  }
}

export function createRebateEnabledTransaction(
  feePayer: PublicKey,
  instructions: TransactionInstruction[],
  connection: Connection
): Transaction {
  const transaction = new Transaction();
  transaction.feePayer = feePayer;
  
  const rebateManager = new HeliusRebateManager(connection);
  
  // Add all instructions
  instructions.forEach(ix => transaction.add(ix));
  
  // Add tip instruction for rebates
  return rebateManager.addTipInstruction(transaction);
}