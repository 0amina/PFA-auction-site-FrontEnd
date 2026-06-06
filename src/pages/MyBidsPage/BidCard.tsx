// src/pages/MyBidsPage/BidCard.tsx
// One row in the bid history. Owns the MyBid shape, the currency/status badges,
// and the display formatters. index.tsx imports { MyBid, BidStatus } + BidCard.

import { Link } from 'react-router-dom';

// ─── Types (shared with index.tsx) ────────────────────────────────────────────

export type Currency = 'TND' | 'SOL';
export type BidStatus = 'winning' | 'outbid' | 'won' | 'lost';

export interface MyBid {
  id: string;
  auctionId: string;
  auctionTitle: string;
  auctionImage: string;
  category: string;
  currency: Currency;
  myBid: number;       // your highest bid on this lot
  currentBid: number;  // current highest bid on the lot
  status: BidStatus;
  bidCount: number;    // how many bids you placed here
  endsAt: string;      // ISO — used while the lot is live
  endedAt?: string;    // ISO — set once won/lost
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: Currency): string {
  if (currency === 'SOL') {
    return `${amount.toLocaleString('en-US', { maximumFractionDigits: 3 })} SOL`;
  }
  return `${amount.toLocaleString('fr-TN', { maximumFractionDigits: 0 })} TND`;
}

function formatTimeLeft(endsAt: string): string {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return 'Ending now';
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS: Record<BidStatus, { label: string; icon: string; cls: string }> = {
  winning: { label: 'Winning', icon: 'trending_up',       cls: 'bg-secondary/10 text-secondary' },
  outbid:  { label: 'Outbid',  icon: 'trending_down',     cls: 'bg-tertiary/10 text-tertiary' },
  won:     { label: 'Won',     icon: 'emoji_events',      cls: 'bg-secondary text-white' },
  lost:    { label: 'Lost',    icon: 'do_not_disturb_on', cls: 'bg-surface-container-high text-outline' },
};

// ─── Badges ───────────────────────────────────────────────────────────────────

function CurrencyBadge({ currency }: { currency: Currency }) {
  if (currency === 'SOL') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-label border border-[#9945FF]/30 bg-[#9945FF]/5 text-[#9945FF]">
        <span className="leading-none text-xs">◎</span> SOL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-label border border-secondary/30 bg-secondary/5 text-secondary">
      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>payments</span>
      TND
    </span>
  );
}

function StatusBadge({ status }: { status: BidStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-label ${s.cls}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>
        {s.icon}
      </span>
      {s.label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function BidCard({ bid }: { bid: MyBid }) {
  const isActive = bid.status === 'winning' || bid.status === 'outbid';
  const yourBidLabel = bid.status === 'won' ? 'Won for' : 'Your bid';

  return (
    <Link
      to={`/auctions/${bid.auctionId}`}
      className="group flex flex-col sm:flex-row gap-5 p-4 sm:p-5 bg-surface-container-lowest rounded-2xl editorial-shadow hover:-translate-y-0.5 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-44 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-surface-container">
        <img
          src={bid.auctionImage}
          alt={bid.auctionTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Middle: badges, title, meta */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <CurrencyBadge currency={bid.currency} />
          <StatusBadge status={bid.status} />
        </div>

        <span className="text-[10px] font-label text-outline uppercase tracking-widest">{bid.category}</span>
        <h3 className="font-headline text-lg font-bold text-on-surface leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {bid.auctionTitle}
        </h3>

        <div className="mt-auto flex items-center gap-2 pt-3 text-xs font-label text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>gavel</span>
            {bid.bidCount} {bid.bidCount === 1 ? 'bid' : 'bids'}
          </span>
          <span className="text-outline-variant">•</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {isActive ? 'schedule' : 'event'}
            </span>
            {isActive ? formatTimeLeft(bid.endsAt) : `Ended ${formatDate(bid.endedAt ?? bid.endsAt)}`}
          </span>
        </div>
      </div>

      {/* Right: amounts + hover hint */}
      <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-center gap-3 sm:text-right sm:border-l sm:border-surface-container sm:pl-5 sm:w-44 shrink-0">
        <div>
          <p className="text-[10px] font-label text-outline uppercase tracking-widest">{yourBidLabel}</p>
          <p className={`font-headline text-xl font-black ${bid.status === 'winning' || bid.status === 'won' ? 'text-secondary' : 'text-on-surface'}`}>
            {formatAmount(bid.myBid, bid.currency)}
          </p>
          {isActive && (
            <p className={`text-[11px] font-label mt-0.5 ${bid.status === 'outbid' ? 'text-tertiary font-semibold' : 'text-on-surface-variant'}`}>
              Top bid {formatAmount(bid.currentBid, bid.currency)}
            </p>
          )}
          {bid.status === 'lost' && (
            <p className="text-[11px] font-label text-on-surface-variant mt-0.5">
              Sold for {formatAmount(bid.currentBid, bid.currency)}
            </p>
          )}
        </div>

        <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-label font-bold opacity-0 group-hover:opacity-100 transition-opacity ${
          bid.status === 'outbid' ? 'text-tertiary' : 'text-primary'
        }`}>
          {bid.status === 'outbid' ? 'Bid again' : 'View lot'}
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_forward</span>
        </span>
      </div>
    </Link>
  );
}