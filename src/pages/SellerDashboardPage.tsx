// src/pages/SellerDashboardPage.tsx
// Orchestrator only — imports data and composes section components.
// No UI logic lives here.

import StatsRow        from './seller-dashboard/StatsRow';
import ActiveListings  from './seller-dashboard/ActiveListings';
import BidFeed         from './seller-dashboard/BidFeed';
import SellerSidePanel from './seller-dashboard/SellerSidePanel';

import {
  STATS,
  LISTINGS,
  BID_FEED,
  PENDING,
  EARNINGS_SEGMENTS,
} from './seller-dashboard/mockData';

export default function SellerDashboardPage() {
  return (
    <div className="px-6 md:px-10 py-10 max-w-[1280px] mx-auto">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-[Plus_Jakarta_Sans] text-2xl font-extrabold text-[#191c1e] mb-1">
          Seller Dashboard
        </h1>
        <p className="font-[Manrope] text-sm text-[#464555]">
          Overview of your auctions, bids, and earnings.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <StatsRow stats={STATS} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <ActiveListings listings={LISTINGS} />
          <BidFeed bids={BID_FEED} />
        </div>
        <div className="lg:col-span-4">
          <SellerSidePanel
            pendingItems={PENDING}
            earningsSegments={EARNINGS_SEGMENTS}
          />
        </div>
      </div>

    </div>
  );
}