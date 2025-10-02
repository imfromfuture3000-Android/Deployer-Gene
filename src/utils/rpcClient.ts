import { Connection } from '@solana/web3.js';

interface RpcResponse<T = any> {
  jsonrpc: string;
  result: T;
  id: string | number;
}

interface TransactionResult {
  signature: string;
  slot: number;
  err: null | any;
  memo: null | string;
  blockTime: null | number;
  confirmationStatus: string;
}

export class HeliusRpcClient {
  private connection: Connection;
  private rpcUrl: string;

  constructor() {
    this.rpcUrl = process.env.RPC_URL || 'https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e';
    this.connection = new Connection(this.rpcUrl, 'confirmed');
  }

  async getProgramAccounts(programId: string, limit = 1000): Promise<any[]> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getProgramAccountsV2',
        params: [programId, { encoding: 'base64', limit }]
      })
    });
    
    const data = await response.json() as RpcResponse;
    return data.result || [];
  }

  async getTokenAccounts(): Promise<any[]> {
    return this.getProgramAccounts('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
  }

  getConnection(): Connection {
    return this.connection;
  }
}