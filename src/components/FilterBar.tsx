// src/components/FilterBar.tsx
// Layout: 3 rows separated by 1px dividers
// Row 1 — category pills
// Row 2 — quick filter toggles
// Row 3 — price range label above, slider + values inline

import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation }                from 'react-router-dom';

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

const CATEGORIES = [
  { label: 'All',          icon: 'apps',            href: '/' },
  { label: 'Fine Art',     icon: 'palette',          href: '/categories/fine-art' },
  { label: 'Timepieces',   icon: 'watch',            href: '/categories/timepieces' },
  { label: 'Jewelry',      icon: 'diamond',          href: '/categories/jewelry' },
  { label: 'Rare Coins',   icon: 'monetization_on',  href: '/categories/rare-coins' },
  { label: 'Automobiles',  icon: 'directions_car',   href: '/categories/automobiles' },
  { label: 'Fine Wine',    icon: 'wine_bar',         href: '/categories/fine-wine' },
  { label: 'Collectibles', icon: 'category',         href: '/categories/collectibles' },
];

const QUICK = [
  { label: 'Ending Soon',  value: 'ending_soon',  icon: 'timer' },
  { label: 'No Reserve',   value: 'no_reserve',   icon: 'lock_open' },
  { label: 'Hot Lots',     value: 'hot_lots',      icon: 'local_fire_department' },
  { label: 'New Arrivals', value: 'new_arrivals',  icon: 'new_releases' },
];

const P_MIN_DEFAULT = 0;
const P_MAX_DEFAULT = 500000;

function fmt(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(0)}k TND` : `${v} TND`;
}

export default function FilterBar({ open, onFilterChange }: FilterBarProps) {
  const location = useLocation();

  const [cat,      setCat]      = useState('All');
  const [quick,    setQuick]    = useState<string[]>([]);
  const [pMin,     setPMin]     = useState(P_MIN_DEFAULT);
  const [pMax,     setPMax]     = useState(P_MAX_DEFAULT);
  const [pTouched, setPTouched] = useState(false);

  // Sync active category with URL
  useEffect(() => {
    const m = CATEGORIES.find(c => c.href !== '/' && location.pathname.startsWith(c.href));
    setCat(m ? m.label : 'All');
  }, [location.pathname]);

  // Notify parent
  useEffect(() => {
    onFilterChange?.({ category: cat, quickFilters: quick, priceMin: pMin, priceMax: pMax });
  }, [cat, quick, pMin, pMax]);

  const toggleQuick = useCallback((v: string) => {
    setQuick(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }, []);

  const activeCount =
    (cat !== 'All' ? 1 : 0) +
    quick.length +
    (pTouched ? 1 : 0);

  function clearAll() {
    setCat('All');
    setQuick([]);
    setPMin(P_MIN_DEFAULT);
    setPMax(P_MAX_DEFAULT);
    setPTouched(false);
  }

  const minPct = (pMin / P_MAX_DEFAULT) * 100;
  const maxPct = (pMax / P_MAX_DEFAULT) * 100;

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
            const active = cat === c.label;
            return (
              <Link
                key={c.label}
                to={c.href}
                onClick={() => setCat(c.label)}
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
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}