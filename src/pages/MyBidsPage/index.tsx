// src/pages/MyBidsPage/index.tsx
// Buyer bid history. Route: /bids  (already linked from Sidebar → "My Bids").
// No sidebar offset — uses full content width like AuctionDetailPage.
//
// ── Wiring later ──────────────────────────────────────────────────────────────
// Replace MOCK_BIDS with a useMyBids() hook hitting the gateway → bidding-service.
// The MyBid shape (in ./BidCard) is the only mapping target.
// e.g.  const bids = useMyBids();   // GET /bids/me via api-gateway
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BidCard, { type MyBid, type BidStatus } from './BidCard';
import { useAuth } from '../../context/AuthContext';
import { request, normalizeAuction, type BackendAuction, type UiAuction } from '../../lib/api';
import { fetchBids } from '../../lib/bids';

type TabKey = 'active' | 'won' | 'lost';

// active tab = lots still live (you're either winning or outbid)
function tabOf(status: BidStatus): TabKey {
  if (status === 'won') return 'won';
  if (status === 'lost') return 'lost';
  return 'active';
}

// There is no per-user bids endpoint, so we reconstruct the buyer's bids by
// scanning each auction's public bid history for the current user.
async function loadMyBids(userId: string): Promise<MyBid[]> {
  const rows = await request<BackendAuction[]>('/auctions', { auth: false });
  const auctions = rows.map(normalizeAuction);

  const results = await Promise.all(
    auctions.map(async (a) => {
      let bids;
      try { bids = await fetchBids(a.id); } catch { return null; }
      const mine = bids.filter((b) => String(b.bidder_id) === String(userId));
      if (mine.length === 0) return null;
      return buildMyBid(a, Math.max(...mine.map((b) => Number(b.amount))), mine.length, userId);
    }),
  );

  return results.filter((b): b is MyBid => b !== null);
}

function buildMyBid(a: UiAuction, myBid: number, count: number, userId: string): MyBid {
  const isClosed = a.status === 'closed';
  const amHighest = String(a.highestBidderId) === String(userId);
  const amWinner = String(a.winnerId) === String(userId) || (isClosed && amHighest);

  let status: BidStatus;
  if (isClosed) status = amWinner ? 'won' : 'lost';
  else status = amHighest ? 'winning' : 'outbid';

  return {
    id: a.id,
    auctionId: a.id,
    auctionTitle: a.title,
    auctionImage: a.imageUrl,
    category: a.category,
    currency: a.bidMethod,
    myBid,
    currentBid: a.currentBid,
    status,
    bidCount: count,
    endsAt: a.endTime,
    endedAt: isClosed ? a.endTime : undefined,
  };
}

// ─── Local sub-components ─────────────────────────────────────────────────────

function StatCard({ icon, value, label, tint, bg }: { icon: string; value: number; label: string; tint: string; bg: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl editorial-shadow p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        <span className={`material-symbols-outlined ${tint}`} style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-headline text-2xl font-black text-on-surface leading-none">{value}</p>
        <p className="text-[11px] font-label text-outline uppercase tracking-widest mt-1.5">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const c = {
    active: { icon: 'gavel',        title: 'No active bids yet', text: 'Find a lot you love and place your first bid.' },
    won:    { icon: 'emoji_events', title: 'No wins yet',        text: 'Auctions you win will appear here.' },
    lost:   { icon: 'history',      title: 'Nothing here',       text: "Lots you bid on but didn't win will show up here." },
  }[tab];

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: '30px' }}>{c.icon}</span>
      </div>
      <h3 className="font-headline text-xl font-bold text-on-surface mb-1.5">{c.title}</h3>
      <p className="font-body text-sm text-on-surface-variant max-w-xs mb-6">{c.text}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm rounded-full hover:brightness-110 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-sm">search</span>
        Browse auctions
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'won',    label: 'Won' },
  { key: 'lost',   label: 'Lost' },
];

export default function MyBidsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('active');
  const [bids, setBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const data = await loadMyBids(user.id);
        if (alive) setBids(data);
      } catch (e: any) {
        if (alive) setError(e?.message ?? 'Failed to load your bids');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user]);

  const counts: Record<TabKey, number> = {
    active: bids.filter((b) => tabOf(b.status) === 'active').length,
    won:    bids.filter((b) => b.status === 'won').length,
    lost:   bids.filter((b) => b.status === 'lost').length,
  };

  const winningCount = bids.filter((b) => b.status === 'winning').length;
  const outbidCount  = bids.filter((b) => b.status === 'outbid').length;

  const visible = bids.filter((b) => tabOf(b.status) === tab);

  return (
    <main className="pt-28 pb-24 px-8 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-extrabold font-headline leading-tight text-on-surface mb-2">
          My Bids
        </h1>
        <p className="font-body text-on-surface-variant">
          Track every lot you've bid on — across TND and SOL auctions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard icon="gavel"         value={counts.active} label="Active bids"  tint="text-primary"   bg="bg-primary/5" />
        <StatCard icon="trending_up"   value={winningCount}  label="Winning now"  tint="text-secondary" bg="bg-secondary/5" />
        <StatCard icon="trending_down" value={outbidCount}   label="Outbid"       tint="text-tertiary"  bg="bg-tertiary/5" />
        <StatCard icon="emoji_events"  value={counts.won}    label="Auctions won" tint="text-secondary" bg="bg-secondary/5" />
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-surface-container mb-8 overflow-x-auto">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-4 whitespace-nowrap font-bold font-headline text-lg transition-colors flex items-center gap-2 ${
                active ? 'border-b-2 border-primary text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.label}
              <span className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-black flex items-center justify-center ${
                active ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
              }`}>
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-on-surface-variant font-label">Loading your bids…</div>
      ) : error ? (
        <div className="py-12 text-center text-error font-label">{error}</div>
      ) : visible.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="space-y-4">
          {visible.map((bid) => (
            <BidCard key={bid.id} bid={bid} />
          ))}
        </div>
      )}
    </main>
  );
}