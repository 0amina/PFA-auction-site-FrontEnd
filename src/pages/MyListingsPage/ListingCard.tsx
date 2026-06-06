// src/pages/MyListingsPage/ListingCard.tsx
// One row in the seller's listings. Owns the Listing shape, badges, formatters,
// and the per-status action buttons. index.tsx imports { Listing, ListingStatus }.

import { Link } from 'react-router-dom';

// ─── Types (shared with index.tsx) ────────────────────────────────────────────

export type Currency = 'TND' | 'SOL';

// awaiting = TND auction ended with a winner, needs seller confirmation to
//            release funds (SOL auto-pays on-chain, so it never lands here).
export type ListingStatus = 'draft' | 'scheduled' | 'live' | 'awaiting' | 'sold' | 'unsold';

export interface Listing {
  id: string;
  title: string;
  image: string;
  category: string;
  currency: Currency;
  status: ListingStatus;
  startingPrice: number;
  currentBid: number;   // 0 if no bids yet
  bidCount: number;
  views: number;
  startsAt: string;     // ISO — relevant for 'scheduled'
  endsAt: string;       // ISO
  endedAt?: string;     // ISO — set once ended/sold/unsold
}

interface ListingCardProps {
  listing: Listing;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onRelist?: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: Currency): string {
  if (currency === 'SOL') {
    return `${amount.toLocaleString('en-US', { maximumFractionDigits: 3 })} SOL`;
  }
  return `${amount.toLocaleString('fr-TN', { maximumFractionDigits: 0 })} TND`;
}

function timeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'now';
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS: Record<ListingStatus, { label: string; icon: string; cls: string; pulse?: boolean }> = {
  live:      { label: 'Live',          icon: 'sensors',           cls: 'bg-secondary/10 text-secondary', pulse: true },
  scheduled: { label: 'Scheduled',     icon: 'schedule',          cls: 'bg-primary/10 text-primary' },
  draft:     { label: 'Draft',         icon: 'edit_note',         cls: 'bg-surface-container-high text-on-surface-variant' },
  awaiting:  { label: 'Action needed', icon: 'priority_high',     cls: 'bg-tertiary/10 text-tertiary' },
  sold:      { label: 'Sold',          icon: 'check_circle',      cls: 'bg-secondary text-white' },
  unsold:    { label: 'Unsold',        icon: 'do_not_disturb_on', cls: 'bg-surface-container-high text-outline' },
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

function StatusBadge({ status }: { status: ListingStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-label ${s.cls}`}>
      {s.pulse ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary" />
        </span>
      ) : (
        <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>
          {s.icon}
        </span>
      )}
      {s.label}
    </span>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

type Variant = 'primary' | 'success' | 'secondary' | 'danger';

const VARIANT: Record<Variant, string> = {
  primary:   'bg-gradient-to-r from-primary to-primary-container text-white hover:brightness-110',
  success:   'bg-secondary text-white hover:brightness-110',
  secondary: 'border border-outline-variant text-on-surface hover:bg-surface-container',
  danger:    'text-tertiary hover:bg-tertiary/5',
};

function Action({
  label, icon, variant = 'secondary', onClick, disabled, title,
}: {
  label: string; icon: string; variant?: Variant;
  onClick?: () => void; disabled?: boolean; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-label font-bold text-sm transition-all active:scale-95
        ${disabled ? 'opacity-40 cursor-not-allowed border border-outline-variant text-on-surface-variant' : VARIANT[variant]}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>
      {label}
    </button>
  );
}

// A Link that looks like a secondary Action (used for "View").
function ViewLink({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-label font-bold text-sm transition-all active:scale-95 border border-outline-variant text-on-surface hover:bg-surface-container"
    >
      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
      View
    </Link>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function ListingCard({ listing, onEdit, onDelete, onPublish, onConfirm, onRelist }: ListingCardProps) {
  const hasBids = listing.bidCount > 0;
  const detailUrl = `/auctions/${listing.id}`;

  // Edit rules: SOL is locked once on-chain (anything past draft); TND locks
  // once the first bid lands.
  const editLocked = listing.currency === 'SOL' ? listing.status !== 'draft' : hasBids;
  const lockReason = listing.currency === 'SOL'
    ? 'On-chain escrow created — editing locked'
    : 'Bidding has started — editing locked';

  // Time / date line per status
  let timeIcon = 'event';
  let timeText = listing.endedAt ? `Ended ${formatDate(listing.endedAt)}` : `Ended ${formatDate(listing.endsAt)}`;
  if (listing.status === 'live') { timeIcon = 'schedule'; timeText = `${timeUntil(listing.endsAt)} left`; }
  else if (listing.status === 'scheduled') { timeIcon = 'event_upcoming'; timeText = `Starts in ${timeUntil(listing.startsAt)}`; }
  else if (listing.status === 'draft') { timeIcon = 'edit_note'; timeText = 'Not published'; }

  return (
    <div className="flex flex-col sm:flex-row gap-5 p-4 sm:p-5 bg-surface-container-lowest rounded-2xl editorial-shadow">
      {/* Thumbnail */}
      <Link to={detailUrl} className="relative w-full h-44 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-surface-container group">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <CurrencyBadge currency={listing.currency} />
          <StatusBadge status={listing.status} />
        </div>

        <span className="text-[10px] font-label text-outline uppercase tracking-widest">{listing.category}</span>
        <Link to={detailUrl} className="font-headline text-lg font-bold text-on-surface leading-snug line-clamp-1 hover:text-primary transition-colors">
          {listing.title}
        </Link>

        {/* Price + meta */}
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mt-3">
          <div>
            <p className="text-[10px] font-label text-outline uppercase tracking-widest">
              {hasBids ? 'Current bid' : 'Starting price'}
            </p>
            <p className="font-headline text-xl font-black text-on-surface">
              {formatAmount(hasBids ? listing.currentBid : listing.startingPrice, listing.currency)}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-label text-on-surface-variant pb-1">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>gavel</span>
              {listing.bidCount} {listing.bidCount === 1 ? 'bid' : 'bids'}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
              {listing.views}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{timeIcon}</span>
              {timeText}
            </span>
          </div>
        </div>

        {/* Confirm-sale nudge (TND ended, awaiting seller confirmation) */}
        {listing.status === 'awaiting' && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-tertiary/[0.06] border border-tertiary/15">
            <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '16px' }}>info</span>
            <p className="text-xs font-label text-on-surface-variant">
              Auction ended — confirm to release{' '}
              <span className="font-bold text-on-surface">{formatAmount(listing.currentBid, listing.currency)}</span>{' '}
              to your balance.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {listing.status === 'draft' && (
            <>
              <Action label="Edit"    icon="edit"          variant="primary" onClick={() => onEdit?.(listing.id)} />
              <Action label="Publish" icon="rocket_launch" variant="success" onClick={() => onPublish?.(listing.id)} />
              <Action label="Delete"  icon="delete"        variant="danger"  onClick={() => onDelete?.(listing.id)} />
            </>
          )}

          {listing.status === 'scheduled' && (
            <>
              <ViewLink to={detailUrl} />
              <Action label="Edit" icon={editLocked ? 'lock' : 'edit'} onClick={() => onEdit?.(listing.id)} disabled={editLocked} title={editLocked ? lockReason : undefined} />
            </>
          )}

          {listing.status === 'live' && (
            <>
              <ViewLink to={detailUrl} />
              <Action label="Edit" icon={editLocked ? 'lock' : 'edit'} onClick={() => onEdit?.(listing.id)} disabled={editLocked} title={editLocked ? lockReason : undefined} />
            </>
          )}

          {listing.status === 'awaiting' && (
            <>
              <Action label="Confirm sale" icon="task_alt" variant="success" onClick={() => onConfirm?.(listing.id)} />
              <ViewLink to={detailUrl} />
            </>
          )}

          {listing.status === 'sold' && <ViewLink to={detailUrl} />}

          {listing.status === 'unsold' && (
            <>
              <Action label="Relist" icon="restart_alt" variant="primary" onClick={() => onRelist?.(listing.id)} />
              <Action label="Delete" icon="delete"      variant="danger"  onClick={() => onDelete?.(listing.id)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}