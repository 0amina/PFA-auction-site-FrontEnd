// src/pages/admin/AuctionsPage.tsx
// Route: /admin/auctions. Platform-wide auction monitoring with force-delete.
// Status filter + search are live; delete mutates local state (wire to gateway).

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type Currency = 'TND' | 'SOL';
type AuctionStatus = 'active' | 'ended' | 'scheduled';

interface AdminAuction {
  id: string;
  title: string;
  seller: string;
  image: string;
  currency: Currency;
  status: AuctionStatus;
  currentBid: number;
  endsIn: string;       // for active/scheduled
  endingSoon?: boolean;
}

const IMGS = [
  'https://feahome.com/cdn/shop/products/YN7048_Chinesehand-craftedFloralVaseIncisedDecorationIntricateDesign_1200_4.jpg?v=1655134134',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1200&auto=format&fit=crop',
];

const BASE: Omit<AdminAuction, 'image'>[] = [
  { id: '1', title: 'Handcrafted Antique Ceramic Vase', seller: 'Galerie Sfax',     currency: 'TND', status: 'active',    currentBid: 920,  endsIn: '1d 17h' },
  { id: '2', title: 'Vintage Rolex Submariner 1680',    seller: 'Karim Belhadj',    currency: 'SOL', status: 'active',    currentBid: 14.2, endsIn: '4h 12m', endingSoon: true },
  { id: '3', title: 'Mid-Century Walnut Lounge Chair',  seller: 'Maison Vintage',   currency: 'TND', status: 'scheduled', currentBid: 0,    endsIn: 'in 2d' },
  { id: '4', title: 'Abstract Oil Painting, No.4',       seller: 'Atelier Nord',     currency: 'SOL', status: 'ended',     currentBid: 8.0,  endsIn: '' },
  { id: '5', title: 'Persian Silk Hand-Knotted Rug',    seller: 'Galerie Sfax',     currency: 'TND', status: 'active',    currentBid: 2350, endsIn: '22h' },
  { id: '6', title: 'Rare First Edition, Leather Bound', seller: 'Sami Trabelsi',    currency: 'SOL', status: 'ended',     currentBid: 4.5,  endsIn: '' },
];

const INITIAL: AdminAuction[] = BASE.map((a, i) => ({ ...a, image: IMGS[i % IMGS.length] }));

const FILTERS: { key: 'all' | AuctionStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'ended', label: 'Ended' },
];

function fmt(n: number, c: Currency) {
  return c === 'SOL' ? `◎ ${n.toLocaleString('en-US', { maximumFractionDigits: 3 })} SOL` : `${n.toLocaleString('fr-TN', { maximumFractionDigits: 0 })} TND`;
}

function CurrencyBadge({ currency }: { currency: Currency }) {
  const sol = currency === 'SOL';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-label border"
      style={sol
        ? { color: '#9945FF', borderColor: '#9945FF4D', backgroundColor: '#9945FF0D' }
        : {}}
    >
      {sol ? <><span className="leading-none">◎</span> SOL</> : <span className="text-secondary">TND</span>}
    </span>
  );
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AdminAuction[]>(INITIAL);
  const [filter, setFilter] = useState<'all' | AuctionStatus>('all');
  const [query, setQuery] = useState('');

  function remove(id: string) {
    // TODO: DELETE /admin/auctions/:id via the gateway → auction-service
    setAuctions((prev) => prev.filter((a) => a.id !== id));
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auctions.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (q && !(`${a.title} ${a.seller}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [auctions, filter, query]);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Live Registry</p>
        <h2 className="font-headline font-extrabold text-4xl tracking-tight">Auctions Monitoring</h2>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex bg-surface-container-low p-1 rounded-xl w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                filter === f.key ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:max-w-xs">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '20px' }}>search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or seller…"
            className="w-full bg-surface-container-low border-none rounded-full h-11 pl-12 pr-4 text-sm font-body focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visible.map((a) => {
          const active = a.status === 'active';
          const ended = a.status === 'ended';
          return (
            <div key={a.id} className="group bg-surface-container-lowest rounded-2xl overflow-hidden editorial-shadow transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img src={a.image} alt={a.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-4 left-4">
                  {active ? (
                    <span className="px-3 py-1 bg-secondary/10 text-secondary backdrop-blur-md rounded-full font-label text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Active
                    </span>
                  ) : ended ? (
                    <span className="px-3 py-1 bg-on-surface-variant/10 text-on-surface-variant backdrop-blur-md rounded-full font-label text-[10px] font-extrabold uppercase tracking-widest">Ended</span>
                  ) : (
                    <span className="px-3 py-1 bg-primary/10 text-primary backdrop-blur-md rounded-full font-label text-[10px] font-extrabold uppercase tracking-widest">Scheduled</span>
                  )}
                </div>
                {a.endingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-tertiary text-on-tertiary rounded-full font-label text-[10px] font-extrabold uppercase tracking-widest">Ending Soon</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyBadge currency={a.currency} />
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface leading-tight mb-1 line-clamp-1">{a.title}</h3>
                <p className="font-label text-xs text-on-surface-variant/70 mb-4">Seller: <span className="text-primary font-medium">{a.seller}</span></p>

                <div className="flex items-center justify-between py-4 border-y border-outline-variant/10 mb-5">
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest opacity-50 mb-1">{ended ? 'Final sale' : 'Current bid'}</p>
                    <p className="font-headline font-extrabold text-xl text-on-surface">{a.currentBid > 0 ? fmt(a.currentBid, a.currency) : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-label text-[10px] uppercase tracking-widest opacity-50 mb-1">{ended ? 'Status' : active ? 'Ends in' : 'Starts'}</p>
                    <p className={`font-headline font-bold text-base ${a.endingSoon ? 'text-tertiary' : 'text-on-surface'}`}>{ended ? 'Closed' : a.endsIn}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link to={`/auctions/${a.id}`} className="flex-1 py-3 bg-surface-container-low rounded-xl font-bold text-sm text-on-surface hover:bg-surface-container-high transition-colors text-center">
                    {ended ? 'Audit log' : 'View details'}
                  </Link>
                  <button onClick={() => remove(a.id)} title="Force delete" className="w-12 h-12 flex items-center justify-center bg-error/5 text-error rounded-xl hover:bg-error hover:text-on-error transition-all">
                    <span className="material-symbols-outlined">delete_outline</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '30px' }}>gavel</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-1.5">No auctions found</h3>
          <p className="font-body text-sm text-on-surface-variant">Try a different status or search term.</p>
        </div>
      )}

      <p className="font-label text-xs text-on-surface-variant/60 mt-10">Showing {visible.length} of {auctions.length} auctions</p>
    </>
  );
}
