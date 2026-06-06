// src/pages/MyBidsPage/index.tsx
// Buyer bid history. Route: /bids  (already linked from Sidebar → "My Bids").
// No sidebar offset — uses full content width like AuctionDetailPage.
//
// ── Wiring later ──────────────────────────────────────────────────────────────
// Replace MOCK_BIDS with a useMyBids() hook hitting the gateway → bidding-service.
// The MyBid shape (in ./BidCard) is the only mapping target.
// e.g.  const bids = useMyBids();   // GET /bids/me via api-gateway
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link } from 'react-router-dom';
import BidCard, { type MyBid, type BidStatus } from './BidCard';

type TabKey = 'active' | 'won' | 'lost';

// active tab = lots still live (you're either winning or outbid)
function tabOf(status: BidStatus): TabKey {
  if (status === 'won') return 'won';
  if (status === 'lost') return 'lost';
  return 'active';
}

// ─── Mock data — swap for the real fetch (see header note) ────────────────────

const now = Date.now();
const inHours = (h: number) => new Date(now + h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

const IMGS = [
  'https://feahome.com/cdn/shop/products/YN7048_Chinesehand-craftedFloralVaseIncisedDecorationIntricateDesign_1200_4.jpg?v=1655134134',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1200&auto=format&fit=crop',
];

// Annotated as Omit<MyBid,'auctionImage'>[] so currency/status keep their literal
// union types instead of widening to string before the map adds the image.
const RAW: Omit<MyBid, 'auctionImage'>[] = [
  {
    id: 'b1', auctionId: '1', auctionTitle: 'Handcrafted Antique Ceramic Vase',
    category: 'Home Decor • Antique Vases', currency: 'TND',
    myBid: 920, currentBid: 920, status: 'winning', bidCount: 3, endsAt: inHours(41),
  },
  {
    id: 'b2', auctionId: '2', auctionTitle: 'Vintage Rolex Submariner 1680',
    category: 'Watches • Diver', currency: 'SOL',
    myBid: 12.5, currentBid: 14.2, status: 'outbid', bidCount: 4, endsAt: inHours(5),
  },
  {
    id: 'b3', auctionId: '3', auctionTitle: 'Mid-Century Walnut Lounge Chair',
    category: 'Furniture • Seating', currency: 'TND',
    myBid: 1850, currentBid: 1850, status: 'winning', bidCount: 2, endsAt: inHours(2),
  },
  {
    id: 'b4', auctionId: '4', auctionTitle: 'Persian Silk Hand-Knotted Rug',
    category: 'Textiles • Rugs', currency: 'TND',
    myBid: 2100, currentBid: 2350, status: 'outbid', bidCount: 2, endsAt: inHours(22),
  },
  {
    id: 'b5', auctionId: '5', auctionTitle: 'Abstract Oil Painting, Untitled No.4',
    category: 'Art • Paintings', currency: 'SOL',
    myBid: 8.0, currentBid: 8.0, status: 'won', bidCount: 5, endsAt: daysAgo(2), endedAt: daysAgo(2),
  },
  {
    id: 'b6', auctionId: '6', auctionTitle: 'Art Deco Brass Table Lamp',
    category: 'Lighting • Table Lamps', currency: 'TND',
    myBid: 430, currentBid: 510, status: 'lost', bidCount: 3, endsAt: daysAgo(4), endedAt: daysAgo(4),
  },
  {
    id: 'b7', auctionId: '7', auctionTitle: 'Rare First Edition, Bound in Leather',
    category: 'Books • First Editions', currency: 'SOL',
    myBid: 3.2, currentBid: 4.5, status: 'lost', bidCount: 1, endsAt: daysAgo(6), endedAt: daysAgo(6),
  },
];

const MOCK_BIDS: MyBid[] = RAW.map((b, i) => ({ ...b, auctionImage: IMGS[i % IMGS.length] }));

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
  const [tab, setTab] = useState<TabKey>('active');

  const bids = MOCK_BIDS; // ← replace with useMyBids()

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
      {visible.length === 0 ? (
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