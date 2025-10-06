require('dotenv').config();
const { Connection } = require('@solana/web3.js');
const axios = require('axios');

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

// RPC Connection
const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
  'confirmed'
);

// WebSocket Connection
const wsConnection = new Connection(
  `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
  'confirmed'
);

// Helius Enhanced APIs
const heliusApi = axios.create({
  baseURL: 'https://api.helius.xyz/v0',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': HELIUS_API_KEY,
  },
});

module.exports = {
  connection,
  wsConnection,
  heliusApi,
  HELIUS_API_KEY
};