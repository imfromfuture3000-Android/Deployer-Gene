#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { Connection, PublicKey } = require('@solana/web3.js');
const fetch = require('node-fetch');

const server = new Server({ name: 'solana-relayer-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

const relayerUrl = process.env.RELAYER_URL;
const relayerPubkey = process.env.RELAYER_PUBKEY;
const relayerApiKey = process.env.RELAYER_API_KEY;
const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'send_transaction_via_relayer',
      description: 'Send signed transaction through relayer for zero-cost deployment',
      inputSchema: {
        type: 'object',
        properties: {
          serializedTransaction: { type: 'string' },
          skipPreflight: { type: 'boolean' }
        },
        required: ['serializedTransaction']
      }
    },
    {
      name: 'get_relayer_status',
      description: 'Check relayer health and fee payer balance',
      inputSchema: { type: 'object', properties: {} }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'send_transaction_via_relayer') {
    try {
      const response = await fetch(relayerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(relayerApiKey && { 'Authorization': `Bearer ${relayerApiKey}` })
        },
        body: JSON.stringify({ transaction: args.serializedTransaction, skipPreflight: args.skipPreflight || false })
      });
      const result = await response.json();
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: true, signature: result.signature, explorer: `https://explorer.solana.com/tx/${result.signature}` }, null, 2) }]
      };
    } catch (error) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }, null, 2) }], isError: true };
    }
  }

  if (name === 'get_relayer_status') {
    try {
      const balance = await connection.getBalance(new PublicKey(relayerPubkey));
      return {
        content: [{ type: 'text', text: JSON.stringify({ relayerPubkey, balance: balance / 1e9, status: balance > 0.1 ? 'operational' : 'low_balance' }, null, 2) }]
      };
    } catch (error) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }, null, 2) }], isError: true };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Relayer MCP Server running');
}

run().catch(console.error);
