// src/pages/AuctionDetailPage/index.tsx
// Auction detail page — wired to the backend.
//   • GET /auctions/:id        → auction details (also bumps view_count server-side)
//   • GET /bids/auction/:id    → bid history
//   • POST /bids (+ /confirm)  → place a bid (TND synchronous, SOL via Phantom)

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ImageGallery from './ImageGallery';
import BiddingBox from './BiddingBox';
import BidHistory from './BidHistory';
import { formatMoney, bidStep, type Currency } from '../../utils/currency';
import { request, normalizeAuction, type BackendAuction, type UiAuction } from '../../lib/api';
import { fetchBids, placeBid, type BidRecord } from '../../lib/bids';
import { useAuth } from '../../context/AuthContext';

const TABS = ['Description', 'Condition Report', 'Shipping'] as const;
type Tab = (typeof TABS)[number];

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function useCountdown(endsAt?: Date): string {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  if (!endsAt) return '—';
  const ms = endsAt.getTime() - Date.now();
  if (ms <= 0) return 'Ended';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();

  const [auction, setAuction] = useState<UiAuction | null>(null);
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Description');

  const load = useCallback(async () => {
    if (!id) return;
    const raw = await request<BackendAuction>(`/auctions/${id}`, { auth: false });
    setAuction(normalizeAuction(raw));
    try {
      setBids(await fetchBids(id));
    } catch {
      setBids([]);
    }
  }, [id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await load();
      } catch (e: any) {
        if (alive) setError(e?.message ?? 'Auction not found');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [load]);

  const currency: Currency = auction?.bidMethod ?? 'TND';
  const countdown = useCountdown(auction?.endsAt);

  const minimumNextBid = useMemo(() => {
    if (!auction) return 0;
    const base = auction.currentBid || auction.startingBid;
    return base + bidStep(currency);
  }, [auction, currency]);

  const reserveMet = auction
    ? auction.reservePrice == null || auction.currentBid >= auction.reservePrice
    : false;

  const handlePlaceBid = useCallback(
    async (amount: number) => {
      if (!id) return;
      await placeBid(id, amount);
      await load();        // refresh current bid + history
      await refreshUser(); // refresh TND balance after a TND bid
    },
    [id, load, refreshUser],
  );

  const bidEntries = useMemo(
    () =>
      bids.map((b, i) => ({
        bidderId: `Bidder #${String(b.bidder_id).slice(0, 6)}`,
        amount: Number(b.amount),
        timeAgo: timeAgo(b.createdAt ?? b.created_at),
        isHighest: i === 0,
      })),
    [bids],
  );

  if (loading) {
    return (
      <main className="pt-28 pb-24 px-8 max-w-7xl mx-auto w-full">
        <p className="text-on-surface-variant font-label">Loading lot…</p>
      </main>
    );
  }

  if (error || !auction) {
    return (
      <main className="pt-28 pb-24 px-8 max-w-7xl mx-auto w-full">
        <p className="text-error font-label">{error ?? 'Auction not found.'}</p>
      </main>
    );
  }

  const images =
    auction.imageUrls.length > 0
      ? auction.imageUrls.map((src, i) => ({ src, alt: `${auction.title} — view ${i + 1}` }))
      : [{ src: auction.imageUrl, alt: auction.title }];

  const isClosed = auction.status === 'closed';

  return (
    <main className="pt-28 pb-24 px-8 max-w-7xl mx-auto w-full">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 font-label text-sm text-on-surface-variant">
        <a href="/" className="hover:text-primary transition-colors">Home</a>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <a href="/auctions" className="hover:text-primary transition-colors">Auctions</a>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-on-surface font-semibold capitalize">{auction.category}</span>
      </nav>

      {/* ── Top grid: gallery (7) + bidding panel (5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Gallery */}
        <div className="lg:col-span-7">
          <ImageGallery images={images} />
        </div>

        {/* Details + Bidding */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Title + consignor */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold font-headline leading-tight text-on-surface mb-4">
              {auction.title}
            </h1>
            <div className="flex items-center gap-3">
              <div>
                <p className="font-label text-xs text-on-surface-variant font-medium uppercase tracking-widest">
                  Settlement
                </p>
                <p className="font-body font-bold text-on-surface">
                  {currency === 'SOL' ? '◎ SOL · On-chain escrow' : 'TND · Konnect'}
                </p>
              </div>
              {user && String(user.id) !== String(auction.sellerId) && (
                <Link
                  to={`/messages?to=${auction.sellerId}&name=${encodeURIComponent('Seller')}`}
                  className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant text-on-surface font-label font-bold text-sm hover:bg-surface-container transition-all"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  Contact seller
                </Link>
              )}
            </div>
          </div>

          {isClosed ? (
            <div className="bg-surface-container-low rounded-2xl p-8">
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                Final Bid
              </p>
              <h2 className="text-4xl font-bold font-headline text-on-surface mb-2">
                {formatMoney(auction.currentBid, currency)}
              </h2>
              <p className="font-label text-sm text-tertiary font-semibold">This auction has ended.</p>
            </div>
          ) : (
            <BiddingBox
              currency={currency}
              currentBid={auction.currentBid}
              minimumNextBid={minimumNextBid}
              reserveMet={reserveMet}
              countdown={countdown}
              estimateLow={auction.startingBid}
              estimateHigh={auction.reservePrice ?? auction.startingBid * 2}
              onPlaceBid={handlePlaceBid}
            />
          )}
        </div>
      </div>

      {/* ── Bottom grid: description tabs (8) + bid history (4) ── */}
      <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Tabs + content */}
        <div className="lg:col-span-8">
          <div className="flex gap-8 border-b border-surface-container mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 whitespace-nowrap font-bold font-headline text-lg transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Description' && (
            <div className="text-on-surface-variant font-body leading-relaxed space-y-6">
              <p className="text-lg font-medium text-on-surface whitespace-pre-line">
                {auction.description || 'No description provided for this lot.'}
              </p>
              {auction.condition && (
                <p className="capitalize">Condition: {auction.condition.replace('_', ' ')}</p>
              )}
            </div>
          )}
          {activeTab === 'Condition Report' && (
            <p className="text-on-surface-variant font-body capitalize">
              {auction.condition ? auction.condition.replace('_', ' ') : 'No condition report available.'}
            </p>
          )}
          {activeTab === 'Shipping' && (
            <p className="text-on-surface-variant font-body">
              Shipping is arranged with the seller after the sale is confirmed.
            </p>
          )}
        </div>

        {/* Bid history */}
        <div className="lg:col-span-4">
          <BidHistory bids={bidEntries} totalCount={auction.bidCount} currency={currency} />
        </div>
      </div>
    </main>
  );
}
