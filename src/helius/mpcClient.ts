import axios, { AxiosInstance } from 'axios';
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction
} from '@solana/web3.js';
import { createHelius } from 'helius-sdk';
import { loadHeliusConfig, HeliusConfig } from './config';

export interface HeliusMpcClient {
  connection: Connection;
  requestPayerSignature: (
    transaction: Transaction | VersionedTransaction,
    feePayer: PublicKey
  ) => Promise<string>;
  submitTransaction: (
    transaction: Transaction | VersionedTransaction | string
  ) => Promise<string>;
  getPriorityFees: (accountKeys?: string[]) => Promise<{
    priorityFeeEstimate?: number;
    priorityFeeLevels?: Record<string, number>;
  }>;
}

const toBase64WireTransaction = (
  transaction: Transaction | VersionedTransaction | string,
  requireAllSignatures = false
): string => {
  if (typeof transaction === 'string') {
    return transaction;
  }

  const serialized = transaction.serialize({
    requireAllSignatures,
    verifySignatures: false
  });

  return Buffer.from(serialized).toString('base64');
};

export const createHeliusMpcClient = (config?: HeliusConfig): HeliusMpcClient => {
  const resolvedConfig = config || loadHeliusConfig();
  const helius = createHelius({ apiKey: resolvedConfig.apiKey });
  const connection = new Connection(resolvedConfig.rpcUrl, 'confirmed');
  const mpcClient: AxiosInstance = axios.create({
    baseURL: resolvedConfig.mpcServerUrl,
    timeout: 15_000
  });

  const requestPayerSignature: HeliusMpcClient['requestPayerSignature'] = async (
    transaction,
    feePayer
  ) => {
    const { data } = await mpcClient.post('/sign', {
      transaction: toBase64WireTransaction(transaction, false),
      feePayer: feePayer.toBase58(),
      relayer: resolvedConfig.relayerPubkeyString
    });

    if (!data?.signature) {
      throw new Error('MPC server did not return a payer signature');
    }

    return data.signature as string;
  };

  const submitTransaction: HeliusMpcClient['submitTransaction'] = async (
    transaction
  ) => {
    const wireTx = toBase64WireTransaction(transaction, true);
    return helius.tx.sendTransaction(wireTx);
  };

  const getPriorityFees: HeliusMpcClient['getPriorityFees'] = async (
    accountKeys
  ) => {
    return helius.getPriorityFeeEstimate({
      accountKeys:
        accountKeys && accountKeys.length > 0
          ? accountKeys
          : [resolvedConfig.relayerPubkeyString],
      options: {
        includeAllPriorityFeeLevels: true
      }
    });
  };

  return {
    connection,
    requestPayerSignature,
    submitTransaction,
    getPriorityFees
  };
};
