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

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ListingCard, { type Listing, type ListingStatus } from './ListingCard';
import { useAuth } from '../../context/AuthContext';
import { useAuthFetch } from '../../hooks/useAuthFetch';
import { request, normalizeAuction, type BackendAuction, type UiAuction } from '../../lib/api';

type TabKey = 'active' | 'drafts' | 'ended';

function tabOf(s: ListingStatus): TabKey {
  if (s === 'draft') return 'drafts';
  if (s === 'live' || s === 'scheduled') return 'active';
  return 'ended'; // awaiting, sold, unsold
}

// Backend auction status → seller-facing listing status.
function toListingStatus(a: UiAuction): ListingStatus {
  switch (a.rawStatus) {
    case 'draft': return 'draft';
    case 'scheduled': return 'scheduled';
    case 'active': return 'live';
    case 'awaiting': return 'awaiting';
    case 'confirmed': return 'sold';
    case 'ended': return a.highestBidderId ? 'sold' : 'unsold';
    default: return 'live';
  }
}

function toListing(a: UiAuction): Listing {
  return {
    id: a.id,
    title: a.title,
    image: a.imageUrl,
    category: a.category,
    currency: a.bidMethod,
    status: toListingStatus(a),
    startingPrice: a.startingBid,
    currentBid: a.bidCount > 0 ? a.currentBid : 0,
    bidCount: a.bidCount,
    views: a.viewCount,
    startsAt: '',
    endsAt: a.endTime,
    endedAt: a.status === 'closed' ? a.endTime : undefined,
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
  const { user, refreshUser } = useAuth();
  const authFetch = useAuthFetch();
  const [tab, setTab] = useState<TabKey>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const rows = await request<BackendAuction[]>('/auctions', { auth: false });
    const mine = rows
      .map(normalizeAuction)
      .filter((a) => String(a.sellerId) === String(user.id))
      .map(toListing);
    setListings(mine);
  }, [user]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try { await load(); }
      catch (e: any) { if (alive) setError(e?.message ?? 'Failed to load your listings'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [load]);

  // ── Action handlers — gateway → auction-service ──
  const onEdit = (id: string) => navigate(`/auctions/${id}/edit`);
  const onPublish = () => {
    alert('Auctions you scheduled go live automatically at their start time.');
  };
  const onDelete = async (id: string) => {
    if (!confirm('Delete this auction? This cannot be undone.')) return;
    const res = await authFetch(`/auctions/${id}`, { method: 'DELETE' });
    if (res.ok) await load();
    else alert('Could not delete this auction.');
  };
  const onConfirm = async (id: string) => {
    const res = await authFetch(`/auctions/${id}/confirm-winner`, { method: 'PATCH' });
    if (res.ok) { await load(); await refreshUser(); }
    else {
      const err = await res.json().catch(() => ({}));
      alert(err.message ?? 'Could not confirm the sale.');
    }
  };
  const onRelist = () => navigate('/auctions/create');

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
      {loading ? (
        <div className="py-20 text-center text-on-surface-variant font-label">Loading your listings…</div>
      ) : error ? (
        <div className="py-12 text-center text-error font-label">{error}</div>
      ) : visible.length === 0 ? (
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