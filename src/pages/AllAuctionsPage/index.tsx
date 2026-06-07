import { useState } from 'react';
import AuctionCard from '../../components/AuctionCard';
import { MOCK_AUCTIONS } from '../../data/mockAuctions';
import { useSearchParams } from 'react-router-dom';

export default function FeaturedAuctionsPage() {
  const [category, setCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // ✅ SEARCH COMES FROM URL (navbar)
  const [params] = useSearchParams();
  const searchFromURL = params.get('search') || '';

  // ✅ FILTER LOGIC
  const filtered = MOCK_AUCTIONS.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchFromURL.toLowerCase());

    const matchesCategory =
      category === 'all' || a.category === category;

    return matchesSearch && matchesCategory;
  });

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

          {/* Optional: show search context */}
          {searchFromURL && (
            <div className="mt-2 text-sm text-slate-600">
              Results for:{" "}
              <span className="font-semibold">"{searchFromURL}"</span>
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
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {filtered.map((auction) => (
    <div key={auction.id}>
      <AuctionCard auction={auction} variant="standard" />
    </div>
  ))}
</div>

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
              <button className="px-5 py-2 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-medium">
                Ending Soon
              </button>

              <button className="px-5 py-2 rounded-full border border-slate-200 bg-white hover:border-primary text-sm font-medium transition">
                Hot Lots
              </button>

              <button className="px-4 py-2 rounded-full border border-slate-200 text-sm">
                No Reserve
              </button>
            </div>
          </div>

          {/* PRICE */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Price Range
              </h3>

              <span className="text-sm font-medium text-primary">
                $10k - $500k+
              </span>
            </div>

            <div className="relative h-10 flex items-center">
              <div className="absolute w-full h-[3px] bg-slate-200 rounded-full" />
              <div className="absolute left-1/4 right-0 h-[3px] bg-primary rounded-full" />

              <div className="absolute left-1/4 -translate-x-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md" />
              <div className="absolute right-0 translate-x-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md" />
            </div>
          </div>

          {/* SORT */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-5">
              Sort By
            </h3>

            <select className="w-full rounded-2xl bg-slate-50/80 px-5 py-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20">
              <option>Highest Bid</option>
              <option>Lowest Bid</option>
              <option>Ending Soonest</option>
              <option>Most Popular</option>
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t border-slate-200/60 flex gap-3 shrink-0 bg-white/60 backdrop-blur-xl">
          <button className="flex-1 py-3 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition">
            Reset
          </button>

          <button className="flex-1 py-3 rounded-full bg-primary text-white text-sm font-medium shadow-lg shadow-primary/20 hover:opacity-95 transition">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}