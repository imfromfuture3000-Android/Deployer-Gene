#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

class RelayerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'deployer-gene-relayer',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'sendRawTransaction',
          description: 'Send raw transaction via relayer (zero-cost)',
          inputSchema: {
            type: 'object',
            properties: {
              transaction: { type: 'string', description: 'Base64 encoded transaction' },
              skipPreflight: { type: 'boolean', default: false }
            },
            required: ['transaction']
          }
        },
        {
          name: 'getRelayerStatus',
          description: 'Check relayer network status',
          inputSchema: { type: 'object', properties: {} }
        }
      ]
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'sendRawTransaction':
          return await this.sendRawTransaction(args.transaction, args.skipPreflight);
        case 'getRelayerStatus':
          return await this.getRelayerStatus();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async sendRawTransaction(transaction, skipPreflight = false) {
    const relayerUrl = process.env.RELAYER_URL;
    const apiKey = process.env.RELAYER_API_KEY;

    if (!relayerUrl) {
      throw new Error('RELAYER_URL not configured');
    }

    try {
      const response = await fetch(relayerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({
          transaction,
          skipPreflight,
          commitment: 'confirmed'
        })
      });

      const result = await response.json();
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            signature: result.signature || result.result,
            status: response.ok ? 'success' : 'error',
            explorer: result.signature ? `https://explorer.solana.com/tx/${result.signature}` : null
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: error.message, status: 'failed' }, null, 2)
        }]
      };
    }
  }

  async getRelayerStatus() {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          relayerUrl: process.env.RELAYER_URL || 'Not configured',
          hasApiKey: !!process.env.RELAYER_API_KEY,
          network: 'mainnet-beta',
          status: 'active'
        }, null, 2)
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (require.main === module) {
  const server = new RelayerMCPServer();
  server.run().catch(console.error);
}

module.exports = RelayerMCPServer;