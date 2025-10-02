import { Connection, PublicKey } from '@solana/web3.js';
import { loadDeployerAuth } from './utils/deployerAuth';

interface AgentMemory {
  sessionId: string;
  startTime: number;
  currentState: string;
  actionHistory: Array<{ timestamp: number; action: string; result: string; }>;
  decisionLog: Array<{ timestamp: number; decision: string; reasoning: string; }>;
  deploymentContext: {
    mintAddress?: string;
    totalBots: number;
    earningsVault: string;
    lastDistribution?: number;
  };
}

class IWhoMe10xAgent {
  private memory: AgentMemory;
  private connection: Connection;
  private deployer = loadDeployerAuth();

  constructor() {
    this.memory = {
      sessionId: `iwm-${Date.now()}`,
      startTime: Date.now(),
      currentState: 'INITIALIZING',
      actionHistory: [],
      decisionLog: [],
      deploymentContext: {
        totalBots: 5,
        earningsVault: 'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR'
      }
    };
    this.connection = new Connection(process.env.RPC_URL!, 'confirmed');
  }

  async analyze(): Promise<string> {
    const decision = this.makeDecision();
    this.logDecision(decision.action, decision.reasoning);
    
    switch (decision.action) {
      case 'DEPLOY_BOTS':
        return this.deployAgentBots();
      case 'DISTRIBUTE_EARNINGS':
        return this.distributeEarnings();
      case 'MONITOR_VAULT':
        return this.monitorVault();
      default:
        return this.getStatus();
    }
  }

  private makeDecision(): { action: string; reasoning: string } {
    const recentActions = this.memory.actionHistory.slice(-5);
    const timeSinceStart = Date.now() - this.memory.startTime;
    
    if (!this.memory.deploymentContext.mintAddress) {
      return { action: 'DEPLOY_BOTS', reasoning: 'No mint detected, initiate bot deployment' };
    }
    
    if (timeSinceStart > 21600000) { // 6 hours
      return { action: 'DISTRIBUTE_EARNINGS', reasoning: 'Time-based earnings distribution cycle' };
    }
    
    return { action: 'MONITOR_VAULT', reasoning: 'Continuous vault monitoring mode' };
  }

  private async deployAgentBots(): Promise<string> {
    this.updateState('DEPLOYING_BOTS');
    this.logAction('deploy_bots', 'Initiating agent bot deployment sequence');
    
    // Execute bot deployment logic
    const { mintToAgentBots } = require('./agentBotMint');
    const config = {
      bots: [
        process.env.BOT_1_PUBKEY,
        process.env.BOT_2_PUBKEY,
        process.env.BOT_3_PUBKEY,
        process.env.BOT_4_PUBKEY,
        process.env.BOT_5_PUBKEY
      ].filter(Boolean),
      initialAmount: "10000",
      investmentAmount: "50000"
    };
    
    await mintToAgentBots(process.env.MINT_ADDRESS!, config);
    return '🤖 Agent bots deployed with 10K + 50K token allocation each';
  }

  private async distributeEarnings(): Promise<string> {
    this.updateState('DISTRIBUTING_EARNINGS');
    this.logAction('distribute_earnings', 'Executing earnings distribution protocol');
    
    const { autoDistributeEarnings } = require('./autoDistributeEarnings');
    const config = {
      bots: [process.env.BOT_1_PUBKEY, process.env.BOT_2_PUBKEY, process.env.BOT_3_PUBKEY, process.env.BOT_4_PUBKEY, process.env.BOT_5_PUBKEY].filter(Boolean),
      reinvestAddress: process.env.TREASURY_PUBKEY!
    };
    
    await autoDistributeEarnings(process.env.MINT_ADDRESS!, config);
    this.memory.deploymentContext.lastDistribution = Date.now();
    return '💰 Earnings distributed: 30% reinvested, 70% to agent bots';
  }

  private async monitorVault(): Promise<string> {
    this.updateState('MONITORING');
    this.logAction('monitor_vault', 'Vault surveillance active');
    
    try {
      const vaultBalance = await this.connection.getBalance(new PublicKey(this.memory.deploymentContext.earningsVault));
      return `🔍 Vault balance: ${vaultBalance / 1e9} SOL | Status: ACTIVE`;
    } catch {
      return '⚠️ Vault monitoring error - connection issue';
    }
  }

  private getStatus(): string {
    const uptime = Math.floor((Date.now() - this.memory.startTime) / 1000);
    return `🧠 I-WHO-ME Agent | Session: ${this.memory.sessionId} | Uptime: ${uptime}s | State: ${this.memory.currentState}`;
  }

  private updateState(state: string): void {
    this.memory.currentState = state;
  }

  private logAction(action: string, result: string): void {
    this.memory.actionHistory.push({ timestamp: Date.now(), action, result });
    if (this.memory.actionHistory.length > 50) this.memory.actionHistory.shift();
  }

  private logDecision(decision: string, reasoning: string): void {
    this.memory.decisionLog.push({ timestamp: Date.now(), decision, reasoning });
    if (this.memory.decisionLog.length > 20) this.memory.decisionLog.shift();
  }

  getMemoryDump(): AgentMemory {
    return this.memory;
  }
}

export { IWhoMe10xAgent };