"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeliusRpcClient = void 0;
const web3_js_1 = require("@solana/web3.js");
class HeliusRpcClient {
    constructor() {
        this.rpcUrl = process.env.RPC_URL || 'https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e';
        this.connection = new web3_js_1.Connection(this.rpcUrl, 'confirmed');
    }
    async getProgramAccounts(programId, limit = 1000) {
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
        const data = await response.json();
        return data.result || [];
    }
    async getTokenAccounts() {
        return this.getProgramAccounts('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    }
    getConnection() {
        return this.connection;
    }
}
exports.HeliusRpcClient = HeliusRpcClient;
