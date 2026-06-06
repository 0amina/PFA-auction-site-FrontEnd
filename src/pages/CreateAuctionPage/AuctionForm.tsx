// src/pages/CreateAuctionPage/AuctionForm.tsx
// Changes vs previous:
// - BidMethod type: 'TND' | 'SOL' added to FormState (update useFormState too — see bottom)
// - Section 03 gains a BidMethodSelector above the price fields
// - TND mode: reserve + starting bid in TND (existing behavior, label updated)
// - SOL mode: reserve + starting bid show side-by-side TND + SOL columns
// - SOL mode: WalletConnectBanner appears below the price grid
// - Currency symbol helper reads from bidMethod

import type { AuctionCategory, AuctionDuration, ConditionGrade } from '../../types/auction';
import type { FormState } from './useFormState';
import ImageUpload from './ImageUpload';

// ─── Constants ────────────────────────────────────────────────────────────────

const INPUT = 'w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-4 font-body';
const CATEGORIES: AuctionCategory[] = ['Timepieces', 'Fine Art', 'Jewelry', 'Automobiles', 'Rare Coins'];
const DURATIONS:  AuctionDuration[]  = ['3 Days', '5 Days', '7 Days', '14 Days', 'Private Sale (No Timer)'];
const CONDITIONS: ConditionGrade[]   = ['Mint (As New)', 'Excellent', 'Good (Shows Wear)', 'Restored', 'Fair (Functional)'];

// Approximate rate — replace with a live feed when you wire the Solana service
const TND_TO_SOL_RATE = 0.0031; // 1 TND ≈ 0.0031 SOL (update as needed)

function tndToSol(tnd: number | ''): string {
  if (tnd === '' || tnd === 0) return '';
  return (tnd * TND_TO_SOL_RATE).toFixed(4);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  form:           FormState;
  setField:       <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  isValid:        boolean;
  onImagesChange: (urls: string[]) => void;
  onSubmit:       (e: React.FormEvent) => void;
  onSaveDraft:    () => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AuctionForm({ form, setField, isValid, onImagesChange, onSubmit, onSaveDraft }: Props) {
  const isSol = form.bidMethod === 'SOL';

  return (
    <form className="space-y-16" onSubmit={onSubmit} noValidate>

      {/* 01 — Basic Information */}
      <Section step="01" title="Basic Information">
        <Field label="Item Title">
          <input
            className={INPUT}
            placeholder="e.g. 1963 Patek Philippe Ref. 2526"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-6">
          <Field label="Category">
            <select className={INPUT} value={form.category} onChange={(e) => setField('category', e.target.value as AuctionCategory)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Provenance">
            <input className={INPUT} placeholder="Era or Year"
              value={form.provenance} onChange={(e) => setField('provenance', e.target.value)} />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            className={`${INPUT} resize-none`}
            rows={5}
            placeholder="Detail the history, significance, and aesthetic qualities..."
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </Field>
      </Section>

      {/* 02 — Visual Documentation */}
      <Section step="02" title="Visual Documentation">
        <ImageUpload onImagesChange={onImagesChange} />
      </Section>

      {/* 03 — Auction Parameters */}
      <Section step="03" title="Auction Parameters">

        {/* ── Bid Method selector ── */}
        <Field label="Bid Method">
          <BidMethodSelector
            value={form.bidMethod}
            onChange={(v) => setField('bidMethod', v)}
          />
        </Field>

        {/* ── Price fields ── */}
        {isSol ? (
          /* SOL mode: two columns per price field (TND | SOL) */
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <DualPriceField
                label="Reserve Price"
                tndValue={form.reservePrice}
                onTndChange={(v) => setField('reservePrice', v)}
              />
              <DualPriceField
                label="Starting Bid"
                tndValue={form.startingBid}
                onTndChange={(v) => setField('startingBid', v)}
              />
            </div>
            <WalletConnectBanner
              connected={form.walletConnected ?? false}
              address={form.walletAddress ?? ''}
              onConnect={() => setField('walletConnected', true)}
              onDisconnect={() => {
                setField('walletConnected', false);
                setField('walletAddress', '');
              }}
            />
          </div>
        ) : (
          /* TND mode: original single-currency layout */
          <div className="grid grid-cols-2 gap-6">
            <Field label="Reserve Price (TND)">
              <PriceInput currency="TND" value={form.reservePrice} onChange={(v) => setField('reservePrice', v)} />
            </Field>
            <Field label="Starting Bid (TND)">
              <PriceInput currency="TND" value={form.startingBid} onChange={(v) => setField('startingBid', v)} />
            </Field>
          </div>
        )}

        {/* ── Duration + Start date (always shown) ── */}
        <div className="grid grid-cols-2 gap-6">
          <Field label="Auction Duration">
            <select className={INPUT} value={form.duration} onChange={(e) => setField('duration', e.target.value as AuctionDuration)}>
              {DURATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Start Date">
            <input type="datetime-local" className={INPUT}
              value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
          </Field>
        </div>

      </Section>

      {/* 04 — Condition & Location */}
      <Section step="04" title="Condition & Location">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Condition Grade">
            <select className={INPUT} value={form.conditionGrade} onChange={(e) => setField('conditionGrade', e.target.value as ConditionGrade)}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Current Location">
            <input className={INPUT} placeholder="City, Country"
              value={form.location} onChange={(e) => setField('location', e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6">
          <span className="material-symbols-outlined text-primary shrink-0">verified_user</span>
          <p className="text-sm font-body text-on-surface-variant">
            Authenticated by <strong>The Curator Concierge</strong>. We may request physical shipment for verification before the auction live-date.
          </p>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-8 border-t border-outline-variant/20">
        <button type="button" onClick={onSaveDraft}
          className="text-on-surface font-headline font-bold hover:text-primary transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">save</span>
          Save Draft
        </button>
        <div className="flex gap-4">
          <button type="button"
            className="px-8 py-4 bg-surface-container-high text-on-surface font-headline font-bold rounded-xl hover:bg-surface-variant transition-all">
            Preview Listing
          </button>
          <button type="submit" disabled={!isValid || (isSol && !form.walletConnected)}
            className="px-12 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none">
            Create Auction
          </button>
        </div>
      </div>

    </form>
  );
}

// ─── BidMethodSelector ────────────────────────────────────────────────────────

type BidMethod = 'TND' | 'SOL';

function BidMethodSelector({ value, onChange }: { value: BidMethod; onChange: (v: BidMethod) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(['TND', 'SOL'] as BidMethod[]).map((method) => {
        const active = value === method;
        const isSol  = method === 'SOL';
        return (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={[
              'flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left',
              active
                ? isSol
                  ? 'border-[#9945FF] bg-[#9945FF]/5'
                  : 'border-primary bg-primary/5'
                : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant/60',
            ].join(' ')}
          >
            {/* Icon */}
            <div className={[
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg font-black font-label transition-colors',
              active
                ? isSol ? 'bg-[#9945FF] text-white' : 'bg-primary text-white'
                : 'bg-surface-container text-on-surface-variant',
            ].join(' ')}>
              {isSol ? '◎' : 'د'}
            </div>

            {/* Text */}
            <div>
              <p className={[
                'font-headline font-bold text-sm',
                active
                  ? isSol ? 'text-[#9945FF]' : 'text-primary'
                  : 'text-on-surface',
              ].join(' ')}>
                {isSol ? 'Solana (SOL)' : 'Tunisian Dinar (TND)'}
              </p>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">
                {isSol ? 'On-chain · Wallet required' : 'Fiat · Off-chain settlement'}
              </p>
            </div>

            {/* Active indicator */}
            {active && (
              <span
                className={`material-symbols-outlined ml-auto text-xl ${isSol ? 'text-[#9945FF]' : 'text-primary'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── DualPriceField (SOL mode) ────────────────────────────────────────────────

function DualPriceField({
  label,
  tndValue,
  onTndChange,
}: {
  label:       string;
  tndValue:    number | '';
  onTndChange: (v: number | '') => void;
}) {
  const solEquiv = tndToSol(tndValue);

  return (
    <div className="space-y-2">
      <label className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-wider block">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {/* TND input */}
        <div className="space-y-1">
          <span className="text-[10px] font-label font-bold text-on-surface-variant/60 uppercase tracking-wider">TND</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm">د</span>
            <input
              type="number"
              min={0}
              className="w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-8 pr-3 py-3 font-body text-sm"
              placeholder="0.00"
              value={tndValue}
              onChange={(e) => onTndChange(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        </div>

        {/* SOL equivalent — read-only, auto-calculated */}
        <div className="space-y-1">
          <span className="text-[10px] font-label font-bold text-[#9945FF]/70 uppercase tracking-wider">SOL ≈</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#9945FF]/60 text-sm">◎</span>
            <input
              type="text"
              readOnly
              className="w-full bg-[#9945FF]/5 border border-[#9945FF]/15 rounded-xl pl-8 pr-3 py-3 font-body text-sm text-[#9945FF] cursor-not-allowed"
              placeholder="auto"
              value={solEquiv}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WalletConnectBanner ──────────────────────────────────────────────────────

function WalletConnectBanner({
  connected,
  address,
  onConnect,
  onDisconnect,
}: {
  connected:    boolean;
  address:      string;
  onConnect:    () => void;
  onDisconnect: () => void;
}) {
  if (connected) {
    return (
      <div className="flex items-center justify-between p-4 bg-[#9945FF]/5 border border-[#9945FF]/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#9945FF]/10 flex items-center justify-center">
            <span className="text-[#9945FF] font-black text-sm">◎</span>
          </div>
          <div>
            <p className="font-label text-sm font-bold text-[#9945FF]">Wallet Connected</p>
            <p className="font-body text-xs text-on-surface-variant font-mono">
              {/* Show a truncated placeholder; replace with real address from wallet adapter */}
              {address || '7xKp…3mQR'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDisconnect}
          className="text-xs font-label font-bold text-on-surface-variant hover:text-tertiary transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-[#9945FF]/5 border-2 border-dashed border-[#9945FF]/25 rounded-xl">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#9945FF]/60">account_balance_wallet</span>
        <div>
          <p className="font-label text-sm font-bold text-on-surface">Connect a Solana Wallet</p>
          <p className="font-body text-xs text-on-surface-variant">
            Required to receive SOL bids on-chain.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onConnect}
        className="px-5 py-2.5 bg-[#9945FF] text-white font-headline font-bold text-xs rounded-xl hover:bg-[#7c35d6] active:scale-95 transition-all flex items-center gap-1.5"
      >
        <span className="text-sm">◎</span>
        Connect Wallet
      </button>
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold font-label text-sm">
          {step}
        </span>
        <h2 className="text-xl font-headline font-bold">{title}</h2>
      </div>
      <div className="p-8 bg-surface-container-low rounded-2xl space-y-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-wider block">
        {label}
      </label>
      {children}
    </div>
  );
}

function PriceInput({
  value,
  onChange,
  currency,
}: {
  value:    number | '';
  onChange: (v: number | '') => void;
  currency: 'TND' | 'SOL';
}) {
  const symbol = currency === 'SOL' ? '◎' : 'د';
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">{symbol}</span>
      <input
        type="number"
        min={0}
        className="w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-8 pr-4 py-4 font-body"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    </div>
  );
}