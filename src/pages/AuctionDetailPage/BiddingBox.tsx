// src/pages/AuctionDetailPage/BiddingBox.tsx
// The main interaction card: current bid, countdown timer, bid input, place-bid CTA.
// Currency-aware — renders a TND (Konnect) flow or a SOL (Phantom/escrow) flow
// depending on the auction's bidMethod. Local to AuctionDetailPage — not shared.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { type Currency, formatMoney, formatRange, currencySymbol, bidStep } from '../../utils/currency';

interface BiddingBoxProps {
  currency: Currency;
  currentBid: number;
  minimumNextBid: number;
  reserveMet: boolean;
  countdown: string;        // e.g. "02h 14m 55s"
  estimateLow: number;
  estimateHigh: number;
  onPlaceBid?: (amount: number, currency: Currency) => Promise<void> | void;
}

const SOL_PURPLE = '#9945FF'; // matches the wallet glyph used on the Connect Wallet page

export default function BiddingBox({
  currency,
  currentBid,
  minimumNextBid,
  reserveMet,
  countdown,
  estimateLow,
  estimateHigh,
  onPlaceBid,
}: BiddingBoxProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSol = currency === 'SOL';
  const walletLinked = !!user?.wallet_address;
  const balance = user?.balance ?? 0;
  const isLoggedIn = !!user;

  // A SOL bid can only be placed from a linked Phantom wallet.
  const needsWallet = isSol && !walletLinked;
  // A TND bid is funded from the user's Konnect balance.
  const insufficientFunds = !isSol && balance < minimumNextBid;

  async function handlePlaceBid() {
    setError(null);
    setSuccess(null);

    if (!isLoggedIn) {
      navigate('/auth/login');
      return;
    }
    if (needsWallet) {
      setError('Link a Phantom wallet before placing a SOL bid.');
      return;
    }

    const amount = Number(bidAmount);
    if (!bidAmount || Number.isNaN(amount)) {
      setError('Enter a valid bid amount.');
      return;
    }
    if (amount < minimumNextBid) {
      setError(`Your bid must be at least ${formatMoney(minimumNextBid, currency)}.`);
      return;
    }
    if (!isSol && amount > balance) {
      setError(`Insufficient balance. You have ${formatMoney(balance, currency)} available.`);
      return;
    }

    try {
      setSubmitting(true);
      await onPlaceBid?.(amount, currency);
      setSuccess(
        isSol
          ? 'Bid placed — your SOL is locked in escrow.'
          : 'Bid placed successfully.',
      );
      setBidAmount('');
    } catch (err: any) {
      setError(err?.message ?? 'Could not place your bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Currency badge */}
      <div className="flex items-center justify-between relative z-10">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-label border"
          style={
            isSol
              ? { color: SOL_PURPLE, borderColor: `${SOL_PURPLE}40`, backgroundColor: `${SOL_PURPLE}0D` }
              : undefined
          }
        >
          <span className={isSol ? 'font-black' : 'material-symbols-outlined text-sm'}>
            {isSol ? '◎' : 'payments'}
          </span>
          {isSol ? 'SOL · On-chain escrow' : 'TND · Konnect'}
        </span>
      </div>

      {/* Current bid + countdown */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="font-label text-xs text-on-surface-variant font-medium uppercase tracking-widest mb-1">
            Current Bid
          </p>
          <h2 className="text-4xl font-bold font-headline text-on-surface">
            {formatMoney(currentBid, currency)}
          </h2>
          {reserveMet && (
            <p className="font-label text-sm text-secondary font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              Reserve Met
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-label text-xs text-tertiary font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
            <span className="material-symbols-outlined text-xs">schedule</span>
            ENDS SOON
          </p>
          <h3 className="text-2xl font-bold font-headline text-tertiary">{countdown}</h3>
        </div>
      </div>

      {/* Bid input */}
      <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-4 relative z-10">
        <div className="flex justify-between items-center text-sm font-label">
          <span className="text-on-surface-variant">Minimum next bid:</span>
          <span className="font-bold text-on-surface">{formatMoney(minimumNextBid, currency)}</span>
        </div>

        {needsWallet ? (
          // ── SOL bidder without a linked wallet ──────────────────────────────
          <Link
            to="/wallet"
            className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-xl font-bold text-lg font-headline transition-all hover:brightness-110 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${SOL_PURPLE}, #7c3aed)` }}
          >
            <span className="font-black text-base leading-none">◎</span>
            Connect Phantom to Bid
          </Link>
        ) : (
          <>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold pointer-events-none">
                {currencySymbol(currency)}
              </span>
              <input
                type="number"
                min={minimumNextBid}
                step={bidStep(currency)}
                value={bidAmount}
                onChange={(e) => {
                  setBidAmount(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={`Enter bid amount in ${currency}`}
                className={`w-full bg-surface-container-low border-none rounded-xl ${
                  isSol ? 'pl-9' : 'pl-14'
                } pr-4 py-4 focus:ring-2 focus:ring-primary/20 font-label font-bold text-lg`}
              />
            </div>

            <button
              onClick={handlePlaceBid}
              disabled={submitting}
              className={`w-full text-white py-4 rounded-xl font-bold text-lg font-headline transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 ${
                isSol ? '' : 'bg-gradient-to-r from-primary to-primary-container'
              }`}
              style={isSol ? { background: `linear-gradient(135deg, ${SOL_PURPLE}, #7c3aed)` } : undefined}
            >
              {submitting && (
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              )}
              {submitting
                ? (isSol ? 'Confirm in Phantom…' : 'Placing bid…')
                : (isSol ? 'Place Bid · Lock in Escrow' : 'Place Your Bid')}
            </button>
          </>
        )}

        {/* Error / status line */}
        {error && (
          <p className="flex items-center gap-1.5 text-center text-sm text-error font-label font-semibold">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </p>
        )}
        {success && (
          <p className="flex items-center gap-1.5 text-center text-sm text-secondary font-label font-semibold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {success}
          </p>
        )}

        {/* Funding context */}
        {!needsWallet && (
          <p className="text-center text-xs text-on-surface-variant font-label">
            {isSol ? (
              <>Your bid is locked in an on-chain escrow and refunded automatically if you're outbid.</>
            ) : insufficientFunds ? (
              <>
                Balance: <span className="font-bold text-tertiary">{formatMoney(balance, currency)}</span> —{' '}
                <Link to="/profile" className="underline font-bold">Add funds</Link> to bid.
              </>
            ) : (
              <>
                Funded from your balance: <span className="font-bold text-on-surface">{formatMoney(balance, currency)}</span>
              </>
            )}
          </p>
        )}

        <p className="text-center text-xs text-on-surface-variant font-label">
          By bidding, you agree to our{' '}
          <a href="/terms" className="underline">Terms &amp; Conditions</a>.
        </p>
      </div>

      {/* Watch + Share */}
      <div className="flex items-center justify-center gap-8 relative z-10">
        <button className="flex items-center gap-2 text-on-surface font-label font-semibold transition-all hover:text-primary">
          <span className="material-symbols-outlined text-lg">favorite</span>
          Watch Item
        </button>
        <button className="flex items-center gap-2 text-on-surface font-label font-semibold transition-all hover:text-primary">
          <span className="material-symbols-outlined text-lg">share</span>
          Share Lot
        </button>
      </div>

      {/* Meta pills */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl">
          <p className="font-label text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mb-1">
            Estimate
          </p>
          <p className="font-body font-bold text-on-surface">{formatRange(estimateLow, estimateHigh, currency)}</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl">
          <p className="font-label text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mb-1">
            Lot Status
          </p>
          <p className="font-body font-bold text-secondary">Active Auction</p>
        </div>
      </div>
    </div>
  );
}
