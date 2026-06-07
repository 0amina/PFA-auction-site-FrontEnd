// src/lib/solana.ts
// Thin wrapper around the Phantom provider for the two on-chain interactions
// the marketplace needs:
//   1. signMessage  — prove wallet ownership when linking a wallet
//   2. signTransaction — sign the place-bid tx built by blockchain-service
//
// blockchain-service builds LEGACY transactions and serialises them to base64
// (`tx.serialize({ requireAllSignatures: false }).toString('base64')`), then
// relays the signed base64 via /bids/confirm. So we deserialize → sign → reserialize.

import { Transaction } from '@solana/web3.js';

export type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
};

export function getPhantom(): PhantomProvider | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { phantom?: { solana?: PhantomProvider }; solana?: PhantomProvider };
  const provider = w.phantom?.solana ?? w.solana;
  return provider?.isPhantom ? provider : null;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Signs a base64-encoded legacy transaction with the connected Phantom wallet
 * and returns the signed transaction re-encoded as base64 (ready for
 * POST /bids/confirm). Does NOT broadcast — the backend relays it.
 */
export async function signTransactionBase64(transactionBase64: string): Promise<string> {
  const provider = getPhantom();
  if (!provider) throw new Error('Phantom wallet not detected.');
  if (!provider.publicKey) await provider.connect();

  const tx = Transaction.from(base64ToBytes(transactionBase64));
  const signed = await provider.signTransaction(tx);
  const serialized = signed.serialize({ requireAllSignatures: false });
  return bytesToBase64(Uint8Array.from(serialized));
}
