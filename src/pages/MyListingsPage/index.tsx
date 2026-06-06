// src/pages/MyListingsPage/index.tsx
// Seller's listings (shown in seller mode). Route: /my-auctions
// Sidebar already links here: "My Listings". Wrap the route in
// <ProtectedRoute roles={['seller']}> in AppRouter.
//
// ── Wiring later ──────────────────────────────────────────────────────────────
// Replace MOCK_LISTINGS with a useMyListings() hook → gateway → auction-service.
// The Listing shape (in ./ListingCard) is the mapping target.
// The action handlers below are stubs — point them at your gateway endpoints.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ListingCard, { type Listing, type ListingStatus } from './ListingCard';

type TabKey = 'active' | 'drafts' | 'ended';

function tabOf(s: ListingStatus): TabKey {
  if (s === 'draft') return 'drafts';
  if (s === 'live' || s === 'scheduled') return 'active';
  return 'ended'; // awaiting, sold, unsold
}

// ─── Mock data — swap for the real fetch (see header note) ────────────────────

const now = Date.now();
const inHours = (h: number) => new Date(now + h * 3_600_000).toISOString();
const inDays  = (d: number) => new Date(now + d * 86_400_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

const IMGS = [
  'https://feahome.com/cdn/shop/products/YN7048_Chinesehand-craftedFloralVaseIncisedDecorationIntricateDesign_1200_4.jpg?v=1655134134',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1200&auto=format&fit=crop',
];

// Annotated as Omit<Listing,'image'>[] so currency/status keep their literal
// union types instead of widening to string before the map adds the image.
const RAW: Omit<Listing, 'image'>[] = [
  {
    id: '1', title: 'Handcrafted Antique Ceramic Vase', category: 'Home Decor • Antique Vases',
    currency: 'TND', status: 'live', startingPrice: 400, currentBid: 920, bidCount: 12, views: 340,
    startsAt: daysAgo(2), endsAt: inHours(41),
  },
  {
    id: '2', title: 'Vintage Rolex Submariner 1680', category: 'Watches • Diver',
    currency: 'SOL', status: 'live', startingPrice: 8, currentBid: 14.2, bidCount: 8, views: 512,
    startsAt: daysAgo(1), endsAt: inHours(5),
  },
  {
    id: '3', title: 'Mid-Century Walnut Lounge Chair', category: 'Furniture • Seating',
    currency: 'TND', status: 'scheduled', startingPrice: 1500, currentBid: 0, bidCount: 0, views: 0,
    startsAt: inDays(2), endsAt: inDays(7),
  },
  {
    id: '4', title: 'Art Deco Brass Table Lamp', category: 'Lighting • Table Lamps',
    currency: 'TND', status: 'draft', startingPrice: 350, currentBid: 0, bidCount: 0, views: 0,
    startsAt: '', endsAt: '',
  },
  {
    id: '5', title: 'Abstract Oil Painting, Untitled No.4', category: 'Art • Paintings',
    currency: 'SOL', status: 'draft', startingPrice: 5, currentBid: 0, bidCount: 0, views: 0,
    startsAt: '', endsAt: '',
  },
  {
    id: '6', title: 'Persian Silk Hand-Knotted Rug', category: 'Textiles • Rugs',
    currency: 'TND', status: 'awaiting', startingPrice: 1200, currentBid: 2350, bidCount: 9, views: 410,
    startsAt: daysAgo(8), endsAt: daysAgo(1), endedAt: daysAgo(1),
  },
  {
    id: '7', title: 'Rare First Edition, Bound in Leather', category: 'Books • First Editions',
    currency: 'SOL', status: 'sold', startingPrice: 2, currentBid: 4.5, bidCount: 6, views: 280,
    startsAt: daysAgo(10), endsAt: daysAgo(3), endedAt: daysAgo(3),
  },
  {
    id: '8', title: 'Vintage Brass Mantel Clock', category: 'Antiques • Clocks',
    currency: 'TND', status: 'unsold', startingPrice: 600, currentBid: 0, bidCount: 0, views: 95,
    startsAt: daysAgo(12), endsAt: daysAgo(5), endedAt: daysAgo(5),
  },
];

const MOCK_LISTINGS: Listing[] = RAW.map((l, i) => ({ ...l, image: IMGS[i % IMGS.length] }));

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
    active: { icon: 'storefront', title: 'No active listings', text: 'Publish a listing and it will appear here once live or scheduled.' },
    drafts: { icon: 'edit_note',  title: 'No drafts',          text: 'Auctions you save without publishing show up here.' },
    ended:  { icon: 'history',    title: 'Nothing here yet',    text: 'Completed and sold auctions will appear here.' },
  }[tab];

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: '30px' }}>{c.icon}</span>
      </div>
      <h3 className="font-headline text-xl font-bold text-on-surface mb-1.5">{c.title}</h3>
      <p className="font-body text-sm text-on-surface-variant max-w-xs mb-6">{c.text}</p>
      <Link
        to="/auctions/create"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm rounded-full hover:brightness-110 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Create auction
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'ended',  label: 'Ended' },
];

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('active');

  const listings = MOCK_LISTINGS; // ← replace with useMyListings()

  // ── Action handlers — wire to gateway → auction-service ──
  const onEdit    = (id: string) => navigate(`/auctions/${id}/edit`);            // add an edit route (CreateAuctionPage in edit mode)
  const onPublish = (_id: string) => { /* PATCH /auctions/:id/publish  */ };
  const onDelete  = (_id: string) => { /* DELETE /auctions/:id          */ };
  const onConfirm = (_id: string) => { /* POST  /auctions/:id/confirm  -> credits seller balance */ };
  const onRelist  = (_id: string) => navigate('/auctions/create');

  const counts: Record<TabKey, number> = {
    active: listings.filter((l) => tabOf(l.status) === 'active').length,
    drafts: listings.filter((l) => l.status === 'draft').length,
    ended:  listings.filter((l) => tabOf(l.status) === 'ended').length,
  };

  const totalBids   = listings.reduce((sum, l) => sum + l.bidCount, 0);
  const actionCount = listings.filter((l) => l.status === 'awaiting').length;
  const soldCount   = listings.filter((l) => l.status === 'sold').length;

  const visible = listings.filter((l) => tabOf(l.status) === tab);

  return (
    <main className="pt-28 pb-24 px-8 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold font-headline leading-tight text-on-surface mb-2">
            My Listings
          </h1>
          <p className="font-body text-on-surface-variant">
            Manage your auctions, drafts, and completed sales.
          </p>
        </div>
        <Link
          to="/auctions/create"
          className="inline-flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm rounded-full hover:brightness-110 active:scale-95 transition-all shrink-0 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New auction
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard icon="storefront"    value={counts.active} label="Active listings" tint="text-primary"   bg="bg-primary/5" />
        <StatCard icon="gavel"         value={totalBids}     label="Total bids"      tint="text-secondary" bg="bg-secondary/5" />
        <StatCard icon="priority_high" value={actionCount}   label="Action needed"   tint="text-tertiary"  bg="bg-tertiary/5" />
        <StatCard icon="check_circle"  value={soldCount}     label="Sold"            tint="text-secondary" bg="bg-secondary/5" />
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
          {visible.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onEdit={onEdit}
              onPublish={onPublish}
              onDelete={onDelete}
              onConfirm={onConfirm}
              onRelist={onRelist}
            />
          ))}
        </div>
      )}
    </main>
  );
}