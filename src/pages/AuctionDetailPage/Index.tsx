// src/pages/AuctionDetailPage/index.tsx
// Auction detail page. No sidebar — uses full content width.
// Reuses: Navbar (via RootLayout), Footer (via RootLayout).
// Local sub-components: ImageGallery, BiddingBox, BidHistory.

import { useState } from 'react';
import ImageGallery from './ImageGallery';
import BiddingBox from './BiddingBox';
import BidHistory from './BidHistory';
import { type Currency } from '../../utils/currency';

// ─── Mock data — replace with useAuction(id) hook once backend is wired ────────
const IMAGES = [
  {
    src: 'https://feahome.com/cdn/shop/products/YN7048_Chinesehand-craftedFloralVaseIncisedDecorationIntricateDesign_1200_4.jpg?v=1655134134?q=80&w=1200&auto=format&fit=crop',
    alt: 'Handcrafted antique ceramic vase with floral patterns',
  },
  {
    src: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop',
    alt: 'Side view of vintage porcelain vase with blue details',
  },
  {
    src: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1200&auto=format&fit=crop',
    alt: 'Close-up of decorative ceramic vase texture and artwork',
  },
  {
    src: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1200&auto=format&fit=crop',
    alt: 'Elegant antique vase displayed on wooden table',
  },
];

const BIDS = [
  { bidderId: 'Bidder #2451', amount: 920, timeAgo: '2 minutes ago', isHighest: true },
  { bidderId: 'Bidder #7712', amount: 890, timeAgo: '10 minutes ago' },
  { bidderId: 'Bidder #4092', amount: 850, timeAgo: '35 minutes ago' },
  { bidderId: 'Bidder #1128', amount: 800, timeAgo: '1 hour ago' },
];

const TABS = ['Description', 'Condition Report', 'Shipping'] as const;
type Tab = (typeof TABS)[number];

// ─────────────────────────────────────────────────────────────────────────────

export default function AuctionDetailPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Description');
  // Currency is a property of the auction (its bidMethod). Until the page is wired
  // to useAuction(id), this toggle lets us preview both the TND and SOL flows.
  const [currency, setCurrency] = useState<Currency>('TND');

  return (
    // No lg:ml-64 — this page has no sidebar in the HTML design
    <main className="pt-28 pb-24 px-8 max-w-7xl mx-auto w-full">

      {/* Breadcrumb */}
      {/* Breadcrumb */}
    <nav className="flex items-center gap-2 mb-8 font-label text-sm text-on-surface-variant">
      <a href="/" className="hover:text-primary transition-colors">Home Decor</a>
      <span className="material-symbols-outlined text-xs">chevron_right</span>
      <a href="/" className="hover:text-primary transition-colors">Antique Vases</a>
      <span className="material-symbols-outlined text-xs">chevron_right</span>
     <span className="text-on-surface font-semibold">Lot #2187</span>
    </nav>

      {/* ── Top grid: gallery (7) + bidding panel (5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Gallery */}
        <div className="lg:col-span-7">
          <ImageGallery images={IMAGES} />
        </div>

        {/* Details + Bidding */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Title + consignor */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold font-headline leading-tight text-on-surface mb-4">
              Handcrafted Antique Ceramic Vase
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIro1sOZ2zSCUC3gdJ5ts_0maBt0Bdz093CEkmoRjVDDAJekHTyETaSaR3IAL6OErsOgMORVI80RjbC9IpYpr5qYOTFW54QcwJ2WxBq1iIGoF10Hcf8fJugGwpPgxads8lrR6EKAgVi0HzFHtm9gXonxI3DyJ73EI6G1EZglr0N3AvT4NYDEQBI4d8MWyDB--F4FCCge5omf1vRTo5GKqAba0ZAWIQuOkr4hIWgXqMB8Vv9ttqEVwEI-k8Vulfi2XGQveXLgY4XQ"
                  alt="Vintage House Gallery"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-label text-xs text-on-surface-variant font-medium uppercase tracking-widest">
                  Consigned by
                </p>
                <p className="font-body font-bold text-on-surface">Vintage House Gallery</p>
              </div>
              <div className="ml-auto">
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold font-label flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  AUTHENTICATED
                </span>
              </div>
            </div>
          </div>

          {/* Currency toggle — in production this is fixed by the auction's bidMethod */}
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl self-start">
            {(['TND', 'SOL'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-4 py-2 rounded-lg font-label font-bold text-sm transition-all ${
                  currency === c
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {c === 'SOL' ? '◎ SOL' : 'TND'}
              </button>
            ))}
          </div>

          {/* Bidding box */}
          <BiddingBox
            currency={currency}
            currentBid={920}
            minimumNextBid={950}
            reserveMet={true}
            countdown="01h 42m 18s"
            estimateLow={800}
            estimateHigh={1200}
            onPlaceBid={(amount, cur) => {
              // TODO(gateway): submit the bid; for now just surface it.
              alert(`Bid placed: ${amount} ${cur}`);
            }}
          />
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

          {/* Tab content */}
          {activeTab === 'Description' && (
            <div className="text-on-surface-variant font-body leading-relaxed space-y-6">
  <p className="text-lg font-medium text-on-surface">
    This handcrafted antique ceramic vase features elegant floral artwork and
    traditional craftsmanship, making it a unique decorative piece for collectors
    and interior design enthusiasts.
  </p>

  <p>
    Carefully preserved over the years, the vase showcases detailed hand-painted
    patterns with a glossy porcelain finish. Its timeless design blends perfectly
    with both modern and vintage interiors. The piece is ideal for living rooms,
    entryways, or decorative shelves.
  </p>

  <ul className="space-y-3 list-none p-0">
    {[
      'Handcrafted ceramic with floral patterns.',
      'Height: 42 cm.',
      'Excellent vintage condition with minimal wear.',
      'Ideal for home decoration or collectors.',
    ].map((item) => (
      <li key={item} className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-sm mt-1">
          check_circle
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
</div>
          )}
          {activeTab !== 'Description' && (
            <p className="text-on-surface-variant font-body">
              [{activeTab}] — content coming soon.
            </p>
          )}
        </div>

        {/* Bid history */}
        <div className="lg:col-span-4">
          <BidHistory bids={BIDS} totalCount={24} currency={currency} />
        </div>
      </div>
    </main>
  );
}