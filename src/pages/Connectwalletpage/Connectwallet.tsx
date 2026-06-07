// src/pages/ConnectWalletPage.tsx
// Connect / link a Phantom (Solana) wallet. Same page for buyers and sellers —
// the copy adapts to the role. Route suggestion: /wallet
//
// The Phantom handshake (detect → connect → signMessage) is real and runs fully
// client-side. The ONLY thing left to wire is persistWallet(), which should send
// the address + ownership signature to your gateway → user-service so the server
// can verify it and store `phantom_wallet_address`.
//
//   import { useAuth } from '../context/AuthContext'  ← reads role + saved wallet
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuthFetch } from '../../hooks/useAuthFetch';

const PURPLE = '#9945FF'; // matches the wallet colour used in the Navbar
const EXPLORER = (addr: string) => `https://explorer.solana.com/address/${addr}?cluster=devnet`;

type Status = 'idle' | 'connecting' | 'signing' | 'saving' | 'linked';

// ─── Phantom provider access (untyped on window) ──────────────────────────────

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
};

function getProvider(): PhantomProvider | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { phantom?: { solana?: PhantomProvider }; solana?: PhantomProvider };
  const provider = w.phantom?.solana ?? w.solana;
  return provider?.isPhantom ? provider : null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shorten(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function toBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function buildLinkMessage(address: string) {
  // For replay protection the nonce should ideally come from your backend.
  const nonce = Math.random().toString(36).slice(2);
  return `Link this Phantom wallet to your AuctionSite account.\n\nWallet: ${address}\nNonce: ${nonce}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConnectWalletPage() {
  const { user, refreshUser } = useAuth();
  const authFetch = useAuthFetch();

  // Persists the linked wallet through the gateway → user-service, which
  // verifies the ed25519 signature against the address before storing it.
  async function persistWallet(payload: { address: string | null; message?: string; signature?: string }) {
    if (!payload.address) return; // disconnect is local-only (no clear endpoint)
    const res = await authFetch('/user/me/wallet', {
      method: 'PATCH',
      body: JSON.stringify({
        phantom_wallet_address: payload.address,
        message: payload.message,
        signature: payload.signature,
        encoding: 'base64',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Failed to link wallet.');
    }
    await refreshUser();
  }

  const isSeller = user?.role === 'seller';
  const savedAddress = (user as { wallet_address?: string | null } | null)?.wallet_address ?? null;

  const [installed, setInstalled] = useState(true);
  const [address, setAddress] = useState<string | null>(savedAddress);
  const [status, setStatus] = useState<Status>(savedAddress ? 'linked' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInstalled(!!getProvider());
  }, []);

  const busy = status === 'connecting' || status === 'signing' || status === 'saving';

  async function handleConnect() {
    const provider = getProvider();
    if (!provider) { setInstalled(false); return; }
    setError(null);
    try {
      setStatus('connecting');
      const res = await provider.connect();
      const addr = res.publicKey.toString();
      setAddress(addr);

      // Prove ownership before saving (so a user can't claim a wallet they don't hold).
      setStatus('signing');
      const message = buildLinkMessage(addr);
      const signed = await provider.signMessage(new TextEncoder().encode(message), 'utf8');

      setStatus('saving');
      await persistWallet({ address: addr, message, signature: toBase64(signed.signature) });

      setStatus('linked');
    } catch (e) {
      const err = e as { code?: number; message?: string };
      setError(err?.code === 4001 ? 'You rejected the request in Phantom.' : (err?.message ?? 'Could not connect to Phantom.'));
      setStatus(savedAddress ? 'linked' : 'idle');
    }
  }

  async function handleDisconnect() {
    const provider = getProvider();
    try { await provider?.disconnect(); } catch { /* ignore */ }
    await persistWallet({ address: null }); // clear on the server too
    setAddress(null);
    setStatus('idle');
    setError(null);
  }

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const connectLabel =
    status === 'connecting' ? 'Opening Phantom…' :
    status === 'signing'    ? 'Confirm in Phantom…' :
    status === 'saving'     ? 'Linking…' :
    'Connect Phantom';

  return (
    <main className="pt-28 pb-24 px-8 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl lg:text-5xl font-extrabold font-headline leading-tight text-on-surface">
            Solana Wallet
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-label border" style={{ color: PURPLE, borderColor: `${PURPLE}40`, backgroundColor: `${PURPLE}0D` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PURPLE }} />
            Devnet
          </span>
        </div>
        <p className="font-body text-on-surface-variant">
          {isSeller
            ? 'Link the wallet where you want to receive SOL payouts from your auctions.'
            : 'Link a wallet so you can place SOL bids on the marketplace.'}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-error-container text-on-error-container">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          <p className="font-label text-sm">{error}</p>
        </div>
      )}

      {/* Main card */}
      <div className="bg-surface-container-lowest rounded-2xl editorial-shadow p-8">

        {/* Wallet glyph */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black" style={{ background: `linear-gradient(135deg, ${PURPLE}, #7c3aed)` }}>
            ◎
          </div>
        </div>

        {/* ── Not installed ── */}
        {!installed ? (
          <div className="text-center">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-2">Phantom not detected</h2>
            <p className="font-body text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
              You'll need the Phantom browser extension to connect a Solana wallet. Install it, then refresh this page.
            </p>
            <a
              href="https://phantom.app/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-headline font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
              style={{ background: `linear-gradient(135deg, ${PURPLE}, #7c3aed)` }}
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Install Phantom
            </a>
          </div>

        /* ── Linked ── */
        ) : status === 'linked' && address ? (
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold font-label mb-4">
              <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Wallet linked
            </div>

            <h2 className="font-headline text-xl font-bold text-on-surface mb-5">You're all set</h2>

            {/* Address pill */}
            <button
              onClick={copyAddress}
              className="group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border mb-3 transition-colors"
              style={{ borderColor: `${PURPLE}33`, backgroundColor: `${PURPLE}08` }}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-black" style={{ color: PURPLE }}>◎</span>
                <span className="font-mono text-sm font-bold truncate" style={{ color: PURPLE }}>{shorten(address)}</span>
              </span>
              <span className="flex items-center gap-1 text-xs font-label font-bold text-on-surface-variant group-hover:text-on-surface shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{copied ? 'done' : 'content_copy'}</span>
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={EXPLORER(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant text-on-surface font-label font-bold text-sm hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>travel_explore</span>
                View on Explorer
              </a>
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-tertiary font-label font-bold text-sm hover:bg-tertiary/5 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>link_off</span>
                Disconnect
              </button>
            </div>
          </div>

        /* ── Idle / connecting ── */
        ) : (
          <div className="text-center">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-2">Connect your wallet</h2>
            <p className="font-body text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
              Phantom will ask you to approve the connection and sign a short message. This proves you own the wallet — no transaction, no fees, and your keys never leave Phantom.
            </p>
            <button
              onClick={handleConnect}
              disabled={busy}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-headline font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${PURPLE}, #7c3aed)` }}
            >
              {busy
                ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                : <span className="font-black text-base leading-none">◎</span>}
              {connectLabel}
            </button>
          </div>
        )}
      </div>

      {/* Why connect */}
      <div className="mt-8">
        <h3 className="font-label text-xs font-bold text-outline uppercase tracking-[0.1em] mb-3">Why connect a wallet?</h3>
        <div className="space-y-3">
          <InfoRow
            icon="gavel"
            highlight={!isSeller}
            title="Place SOL bids"
            text="Your bid is locked in an on-chain escrow until the auction ends, and refunded automatically if you're outbid."
          />
          <InfoRow
            icon="payments"
            highlight={isSeller}
            title="Receive payouts"
            text="When a SOL auction you list closes, the winning amount is released to this wallet automatically by the smart contract."
          />
        </div>
      </div>

      {/* Security note */}
      <div className="mt-6 flex items-start gap-2 px-4 py-3 rounded-xl bg-surface-container">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: '17px' }}>shield</span>
        <p className="font-label text-xs text-on-surface-variant leading-relaxed">
          AuctionSite never asks for your seed phrase or private keys. We only store your public address, verified by a wallet signature. This marketplace runs on <span className="font-bold text-on-surface">Solana Devnet</span> — set Phantom to Devnet and fund it from the faucet to test.
        </p>
      </div>
    </main>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function InfoRow({ icon, title, text, highlight }: { icon: string; title: string; text: string; highlight: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl bg-surface-container-lowest editorial-shadow ${highlight ? 'ring-1' : ''}`}
      style={highlight ? { boxShadow: `0 0 0 1px ${PURPLE}40` } : undefined}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PURPLE}12` }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: PURPLE, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-headline text-sm font-bold text-on-surface">{title}</p>
          {highlight && (
            <span className="text-[10px] font-label font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ color: PURPLE, backgroundColor: `${PURPLE}14` }}>
              You
            </span>
          )}
        </div>
        <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-0.5">{text}</p>
      </div>
    </div>
  );
}