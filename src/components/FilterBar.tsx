// src/components/FilterBar.tsx
// Category quick-nav shown under the navbar. Selecting a category drives the
// /auctions listing via the `?category=` query param (backend enum values),
// which AllAuctionsPage reads and filters on.

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export interface ActiveFilters {
  category:     string;
  quickFilters: string[];
  priceMin:     number;
  priceMax:     number;
}

interface FilterBarProps {
  open:            boolean;
  onFilterChange?: (f: ActiveFilters) => void;
}

// `value` matches the auction-service AuctionCategory enum; 'all' clears it.
const CATEGORIES = [
  { label: 'All',           value: 'all',              icon: 'apps' },
  { label: 'Art',           value: 'art',              icon: 'palette' },
  { label: 'Jewelry',       value: 'jewelry',          icon: 'diamond' },
  { label: 'Vehicles',      value: 'vehicles',         icon: 'directions_car' },
  { label: 'Electronics',   value: 'electronics',      icon: 'devices' },
  { label: 'Furniture',     value: 'furniture',        icon: 'chair' },
  { label: 'Fashion',       value: 'fashion',          icon: 'checkroom' },
  { label: 'Collectibles',  value: 'collectibles',     icon: 'category' },
  { label: 'Pets & Animals', value: 'pets_and_animals', icon: 'pets' },
];

const P_MAX_DEFAULT = 500000;

export default function FilterBar({ open, onFilterChange }: FilterBarProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const activeCategory = params.get('category') ?? 'all';

  const [cat, setCat] = useState(activeCategory);

  // Keep the highlighted pill in sync with the URL.
  useEffect(() => {
    setCat(activeCategory);
  }, [activeCategory]);

  // Notify parent (drives the navbar filter-count badge).
  useEffect(() => {
    onFilterChange?.({ category: cat, quickFilters: [], priceMin: 0, priceMax: P_MAX_DEFAULT });
  }, [cat, onFilterChange]);

  function selectCategory(value: string) {
    // Preserve any active search term while swapping the category.
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete('category');
    else next.set('category', value);
    navigate({ pathname: '/auctions', search: next.toString() });
  }

  return (
    <div
      className={`
        fixed top-16 left-0 right-0 z-40
        bg-[#f0f2f4]/97 dark:bg-slate-900/97 backdrop-blur-xl
        border-b border-black/[0.07] dark:border-white/[0.07]
        transition-all duration-300 ease-in-out
        ${open
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-2 pointer-events-none'
        }
      `}
    >

      {/* ── Row 1: Categories ─────────────────────────────────────────── */}
      <div className="px-8 py-2.5 flex items-center gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
          {CATEGORIES.map((c) => {
            const active = cat === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => selectCategory(c.value)}
                className={`
  flex items-center gap-2 px-4 py-2 rounded-full shrink-0
  font-label text-sm font-semibold whitespace-nowrap select-none
  transition-all duration-200
  ${active
    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
    : 'bg-white/80 dark:bg-slate-800 text-on-surface border border-black/[0.07] dark:border-white/[0.09] hover:bg-white dark:hover:bg-slate-700'
  }
`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '16px',
                    fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {c.icon}
                </span>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
