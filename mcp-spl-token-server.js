#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { Connection, PublicKey } = require('@solana/web3.js');

const server = new Server({ name: 'spl-token-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'create_mint',
      description: 'Create new SPL token mint (mainnet only)',
      inputSchema: {
        type: 'object',
        properties: {
          decimals: { type: 'number' },
          mintAuthority: { type: 'string' },
          freezeAuthority: { type: 'string' }
        },
        required: ['mintAuthority']
      }
    },
    {
      name: 'mint_tokens',
      description: 'Mint tokens to destination account',
      inputSchema: {
        type: 'object',
        properties: {
          mint: { type: 'string' },
          destination: { type: 'string' },
          amount: { type: 'string' }
        },
        required: ['mint', 'destination', 'amount']
      }
    },
    {
      name: 'get_token_supply',
      description: 'Get current token supply',
      inputSchema: {
        type: 'object',
        properties: { mint: { type: 'string' } },
        required: ['mint']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'create_mint') {
    return {
      content: [{ type: 'text', text: JSON.stringify({ instruction: 'create_mint', decimals: args.decimals || 9, mintAuthority: args.mintAuthority, freezeAuthority: args.freezeAuthority || null, note: 'Sign and send via relayer' }, null, 2) }]
    };
  }

  if (name === 'mint_tokens') {
    return {
      content: [{ type: 'text', text: JSON.stringify({ instruction: 'mint_to', mint: args.mint, destination: args.destination, amount: args.amount, note: 'Sign with mint authority, send via relayer' }, null, 2) }]
    };
  }

  if (name === 'get_token_supply') {
    try {
      const supply = await connection.getTokenSupply(new PublicKey(args.mint));
      return {
        content: [{ type: 'text', text: JSON.stringify({ mint: args.mint, supply: supply.value.uiAmount, decimals: supply.value.decimals }, null, 2) }]
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
  console.error('SPL Token MCP Server running');
}

run().catch(console.error);
