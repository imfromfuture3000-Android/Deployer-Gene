import { PublicKey } from '@solana/web3.js';

export const DEFAULT_RPC_HOST = 'https://mainnet.helius-rpc.com';
export const DEFAULT_RELAYER_URL = 'https://api.helius.xyz/v0/transactions/submit';
export const DEFAULT_MPC_SERVER_URL = 'https://mpc.helius.xyz';
export const DEFAULT_RELAYER_PUBKEY = 'HeLiuSrpc1111111111111111111111111111111111';

export const DEFAULT_COMPUTE_UNIT_LIMIT = 207_768;
export const DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS = 1_000;
export const DEFAULT_BASE_FEE_LAMPORTS = 5_000;

export interface HeliusConfig {
  apiKey: string;
  rpcUrl: string;
  relayerUrl: string;
  relayerPubkey: PublicKey;
  relayerPubkeyString: string;
  mpcServerUrl: string;
  computeUnitLimit: number;
  priorityFeeMicroLamports: number;
  baseFeeLamports: number;
}

const requireEnvValue = (value: string | undefined, name: string): string => {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const validatePublicKey = (value: string, name: string): PublicKey => {
  try {
    return new PublicKey(value);
  } catch {
    throw new Error(`Invalid ${name}: ${value}`);
  }
};

const parseNumberEnv = (
  value: string | undefined,
  fallback: number,
  name: string
): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`${name} must be a positive number. Received: ${value}`);
  }

  return parsed;
};

export const loadHeliusConfig = (env: NodeJS.ProcessEnv = process.env): HeliusConfig => {
  const apiKey = requireEnvValue(env.HELIUS_API_KEY, 'HELIUS_API_KEY');

  const rpcUrl =
    env.RPC_URL && env.RPC_URL.trim().length > 0
      ? env.RPC_URL
      : `${DEFAULT_RPC_HOST}/?api-key=${apiKey}`;

  const relayerUrl = env.RELAYER_URL?.trim() || DEFAULT_RELAYER_URL;
  const relayerPubkeyString =
    env.RELAYER_PUBKEY?.trim() || DEFAULT_RELAYER_PUBKEY;
  const relayerPubkey = validatePublicKey(relayerPubkeyString, 'RELAYER_PUBKEY');

  const mpcServerUrl = env.MPC_SERVER_URL?.trim() || DEFAULT_MPC_SERVER_URL;
  if (!mpcServerUrl.startsWith('http')) {
    throw new Error(`MPC_SERVER_URL must be an http(s) URL. Received: ${mpcServerUrl}`);
  }

  const computeUnitLimit = parseNumberEnv(
    env.HELIUS_COMPUTE_UNIT_LIMIT,
    DEFAULT_COMPUTE_UNIT_LIMIT,
    'HELIUS_COMPUTE_UNIT_LIMIT'
  );

  const priorityFeeMicroLamports = parseNumberEnv(
    env.HELIUS_PRIORITY_FEE_MICRO_LAMPORTS,
    DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS,
    'HELIUS_PRIORITY_FEE_MICRO_LAMPORTS'
  );

  const baseFeeLamports = parseNumberEnv(
    env.HELIUS_BASE_FEE_LAMPORTS,
    DEFAULT_BASE_FEE_LAMPORTS,
    'HELIUS_BASE_FEE_LAMPORTS'
  );

  return {
    apiKey,
    rpcUrl,
    relayerUrl,
    relayerPubkey,
    relayerPubkeyString,
    mpcServerUrl,
    computeUnitLimit,
    priorityFeeMicroLamports,
    baseFeeLamports
  };
};

export const heliusFailoverRpcUrls = (apiKey: string): string[] => [
  `${DEFAULT_RPC_HOST}/?api-key=${apiKey}`,
  `https://rpc.helius.xyz/?api-key=${apiKey}`
];
