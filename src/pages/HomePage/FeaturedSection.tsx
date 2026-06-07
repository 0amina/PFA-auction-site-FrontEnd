import { useEffect, useState } from 'react';
import AuctionCard from '../../components/AuctionCard';
import { Link } from 'react-router-dom';
import { request, normalizeAuction, type BackendAuction, type UiAuction } from '../../lib/api';

export default function FeaturedSection() {
  const [auctions, setAuctions] = useState<UiAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Public endpoint — show the live (active) lots first.
        const rows = await request<BackendAuction[]>('/auctions?status=active', { auth: false });
        if (alive) setAuctions(rows.map(normalizeAuction));
      } catch (e: any) {
        if (alive) setError(e?.message ?? 'Failed to load auctions');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const [featured, ...rest] = auctions;

  return (
    <>
      <section className="mt-16"></section>

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight">
            Featured Lots
          </h2>
          <p className="text-on-surface-variant font-label text-sm mt-1">
            Exclusively curated masterpieces with active bidding
          </p>
        </div>

        <Link
          to="/auctions"
          className="text-primary font-semibold text-sm border-b-2 border-primary/30 hover:border-primary transition pb-1"
        >
          View all featured
        </Link>
      </div>

      {loading && (
        <div className="py-20 text-center text-on-surface-variant font-label">Loading featured lots…</div>
      )}

      {!loading && error && (
        <div className="py-12 text-center text-error font-label">{error}</div>
      )}

      {!loading && !error && auctions.length === 0 && (
        <div className="py-16 text-center text-on-surface-variant font-label">
          No active auctions right now. Check back soon.
        </div>
      )}

      {/* GRID (IMPORTANT: KEEP 12 GRID) */}
      {!loading && !error && auctions.length > 0 && (
        <div className="grid grid-cols-12 gap-8">
          <AuctionCard auction={featured} variant="featured" />

          {rest.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} variant="standard" />
          ))}
        </div>
      )}
    </>
  );
}
