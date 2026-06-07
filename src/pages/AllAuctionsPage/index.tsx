import { useEffect, useMemo, useState } from 'react';
import AuctionCard from '../../components/AuctionCard';
import { useSearchParams } from 'react-router-dom';
import { request, normalizeAuction, type BackendAuction, type UiAuction } from '../../lib/api';

type SortKey = 'highest' | 'lowest' | 'ending' | 'popular';
type QuickFilter = 'ending_soon' | 'hot' | 'no_reserve';

const P_MAX_DEFAULT = 500000;

export default function FeaturedAuctionsPage() {
  const [auctions, setAuctions] = useState<UiAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search + category come from the URL (navbar search box / category bar).
  const [params, setParams] = useSearchParams();
  const searchFromURL = params.get('search') || '';
  const categoryFromURL = params.get('category') || 'all';

  // In-panel filters (client-side).
  const [quick, setQuick] = useState<Set<QuickFilter>>(new Set());
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [sort, setSort] = useState<SortKey>('ending');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await request<BackendAuction[]>('/auctions', { auth: false });
        if (alive) setAuctions(rows.map(normalizeAuction));
      } catch (e: any) {
        if (alive) setError(e?.message ?? 'Failed to load auctions');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const toggleQuick = (f: QuickFilter) =>
    setQuick((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });

  const resetFilters = () => {
    setQuick(new Set());
    setPriceMin('');
    setPriceMax('');
    setSort('ending');
    // Clear category + search from the URL too.
    const next = new URLSearchParams(params);
    next.delete('category');
    next.delete('search');
    setParams(next, { replace: true });
  };

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const visible = useMemo(() => {
    const min = priceMin === '' ? 0 : priceMin;
    const max = priceMax === '' ? Infinity : priceMax;
    const term = searchFromURL.toLowerCase();

    const filtered = auctions.filter((a) => {
      if (term && !a.title.toLowerCase().includes(term)) return false;
      if (categoryFromURL !== 'all' && a.category !== categoryFromURL) return false;
      if (a.currentBid < min || a.currentBid > max) return false;
      if (quick.has('ending_soon') && a.status !== 'ending_soon') return false;
      if (quick.has('hot') && !a.isHotLot) return false;
      if (quick.has('no_reserve') && a.hasReserve) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case 'highest': sorted.sort((a, b) => b.currentBid - a.currentBid); break;
      case 'lowest':  sorted.sort((a, b) => a.currentBid - b.currentBid); break;
      case 'popular': sorted.sort((a, b) => b.viewCount - a.viewCount); break;
      case 'ending':  sorted.sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime()); break;
    }
    return sorted;
  }, [auctions, searchFromURL, categoryFromURL, quick, priceMin, priceMax, sort]);

  const activeFilterCount =
    quick.size +
    (categoryFromURL !== 'all' ? 1 : 0) +
    (priceMin !== '' || priceMax !== '' ? 1 : 0);

  return (
    <div className="mt-10 px-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-headline font-semibold">
            All Featured Auctions
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Browse, filter and discover exclusive lots
          </p>

          {(searchFromURL || categoryFromURL !== 'all') && (
            <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
              {searchFromURL && (
                <span>Results for: <span className="font-semibold">"{searchFromURL}"</span></span>
              )}
              {categoryFromURL !== 'all' && (
                <span className="capitalize px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {categoryFromURL.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* FILTER BUTTON */}
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium bg-white hover:bg-gray-50 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* GRID */}
      {loading && (
        <div className="py-20 text-center text-on-surface-variant">Loading auctions…</div>
      )}
      {!loading && error && (
        <div className="py-12 text-center text-error">{error}</div>
      )}
      {!loading && !error && visible.length === 0 && (
        <div className="py-20 text-center text-on-surface-variant">
          No auctions match your filters.
        </div>
      )}
      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((auction) => (
            <div key={auction.id}>
              <AuctionCard auction={auction} variant="standard" />
            </div>
          ))}
        </div>
      )}

      {/* OVERLAY */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* FILTER PANEL */}
      <div
        className={`fixed top-0 right-0 h-screen w-full md:w-[480px]
        bg-white/75 backdrop-blur-2xl
        shadow-[-20px_0px_60px_rgba(0,0,0,0.08)]
        border-l border-slate-200/60
        z-50 transition-transform duration-500 flex flex-col
        ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60">
          <h2 className="text-base font-semibold tracking-wide text-slate-900">
            Filters
          </h2>

          <button
            onClick={() => setShowFilters(false)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10">

          {/* STATUS */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-5">
              Status
            </h3>

            <div className="flex flex-wrap gap-2">
              {([
                { key: 'ending_soon', label: 'Ending Soon' },
                { key: 'hot',         label: 'Hot Lots' },
                { key: 'no_reserve',  label: 'No Reserve' },
              ] as { key: QuickFilter; label: string }[]).map(({ key, label }) => {
                const active = quick.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleQuick(key)}
                    className={`px-5 py-2 rounded-full border text-sm font-medium transition ${
                      active
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'border-slate-200 bg-white hover:border-primary'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PRICE */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Price Range
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">د</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-2xl bg-slate-50/80 pl-8 pr-3 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <span className="text-slate-400">–</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">د</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-2xl bg-slate-50/80 pl-8 pr-3 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Defaults to all prices up to {P_MAX_DEFAULT.toLocaleString()}+ TND.
            </p>
          </div>

          {/* SORT */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-5">
              Sort By
            </h3>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full rounded-2xl bg-slate-50/80 px-5 py-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="highest">Highest Bid</option>
              <option value="lowest">Lowest Bid</option>
              <option value="ending">Ending Soonest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t border-slate-200/60 flex gap-3 shrink-0 bg-white/60 backdrop-blur-xl">
          <button
            onClick={resetFilters}
            className="flex-1 py-3 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition"
          >
            Reset
          </button>

          <button
            onClick={() => setShowFilters(false)}
            className="flex-1 py-3 rounded-full bg-primary text-white text-sm font-medium shadow-lg shadow-primary/20 hover:opacity-95 transition"
          >
            Show {visible.length} {visible.length === 1 ? 'Lot' : 'Lots'}
          </button>
        </div>
      </div>
    </div>
  );
}
