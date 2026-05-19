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
  return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
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
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-full shrink-0
                  font-label text-xs font-semibold whitespace-nowrap select-none
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
                    fontSize: '13px',
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

      {/* ── Divider 1 ─────────────────────────────────────────────────── */}
      <div className="mx-8 h-px bg-black/[0.07] dark:bg-white/[0.07]" />

      {/* ── Row 2: Quick filters ───────────────────────────────────────── */}
      <div className="px-8 py-2.5 flex items-center gap-1.5">
        {QUICK.map((f) => {
          const on = quick.includes(f.value);
          return (
            <button
              key={f.value}
              onClick={() => toggleQuick(f.value)}
              aria-pressed={on}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full
                font-label text-xs font-semibold whitespace-nowrap select-none
                transition-all duration-200
                ${on
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-white/80 dark:bg-slate-800 text-on-surface-variant border border-black/[0.07] dark:border-white/[0.09] hover:text-on-surface hover:border-primary/20'
                }
              `}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '13px',
                  fontVariationSettings: on ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {f.icon}
              </span>
              {f.label}
              {on && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '11px', fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Divider 2 ─────────────────────────────────────────────────── */}
      <div className="mx-8 h-px bg-black/[0.07] dark:bg-white/[0.07]" />

      {/* ── Row 3: Price range ────────────────────────────────────────── */}
      <div className="px-8 pt-2.5 pb-3">

        {/* Label row */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-label text-[10px] font-bold text-outline uppercase tracking-widest">
            Price Range
          </span>
          {pTouched && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 font-label text-[10px] font-semibold text-tertiary hover:underline"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
              {activeCount > 1 ? `Clear all (${activeCount})` : 'Reset'}
            </button>
          )}
          {!pTouched && activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 font-label text-[10px] font-semibold text-tertiary hover:underline"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
              Clear ({activeCount})
            </button>
          )}
        </div>

        {/* Slider + value labels */}
        <div className="flex items-center gap-4">

          {/* Min value */}
          <span className="font-label text-xs font-bold text-on-surface tabular-nums shrink-0 w-12 text-right">
            {fmt(pMin)}
          </span>

          {/* Dual-thumb track */}
          <div className="relative flex-1 flex items-center h-5">
            {/* Track background */}
            <div className="absolute w-full h-1 rounded-full bg-black/10 dark:bg-white/10" />

            {/* Filled range segment */}
            <div
              className="absolute h-1 rounded-full bg-primary transition-all duration-100"
              style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
            />

            {/* Min thumb — transparent range input */}
            <input
              type="range"
              min={P_MIN_DEFAULT}
              max={P_MAX_DEFAULT}
              step={5000}
              value={pMin}
              onChange={e => {
                const v = Math.min(+e.target.value, pMax - 5000);
                setPMin(v);
                setPTouched(true);
              }}
              className="absolute w-full h-full opacity-0 cursor-pointer"
              style={{ zIndex: pMin > P_MAX_DEFAULT - 10000 ? 5 : 3 }}
            />

            {/* Max thumb — transparent range input */}
            <input
              type="range"
              min={P_MIN_DEFAULT}
              max={P_MAX_DEFAULT}
              step={5000}
              value={pMax}
              onChange={e => {
                const v = Math.max(+e.target.value, pMin + 5000);
                setPMax(v);
                setPTouched(true);
              }}
              className="absolute w-full h-full opacity-0 cursor-pointer"
              style={{ zIndex: 4 }}
            />

            {/* Min thumb visual */}
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-primary shadow-sm pointer-events-none transition-[left] duration-75"
              style={{ left: `calc(${minPct}% - 7px)` }}
            />

            {/* Max thumb visual */}
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-primary shadow-sm pointer-events-none transition-[left] duration-75"
              style={{ left: `calc(${maxPct}% - 7px)` }}
            />
          </div>

          {/* Max value */}
          <span className="font-label text-xs font-bold text-on-surface tabular-nums shrink-0 w-14">
            {pMax >= P_MAX_DEFAULT ? '$500k+' : fmt(pMax)}
          </span>

        </div>
      </div>

    </div>
  );
}