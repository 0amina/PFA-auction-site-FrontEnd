// src/pages/seller-dashboard/ActiveListings.tsx

import { GlassCard, EmptyState, ActionMenu } from './ui';
import type { Listing, TimeStatus } from './types';

const timePill: Record<TimeStatus, string> = {
  critical: 'bg-[#960014]/10 text-[#960014] border-[#960014]/20',
  warning:  'bg-amber-500/10 text-amber-600  border-amber-500/20',
  safe:     'bg-[#006c49]/10 text-[#006c49]  border-[#006c49]/20',
};

interface Props {
  listings: Listing[];
}

export default function ActiveListings({ listings }: Props) {
  return (
    <GlassCard>
      <div className="px-6 py-5 border-b border-[#c7c4d8]/15 flex justify-between items-center">
        <h2 className="font-[Plus_Jakarta_Sans] text-lg font-bold text-[#191c1e]">
          Active Listings
        </h2>
        <button className="font-[Inter] text-sm font-bold text-[#3525cd] hover:underline">
          View All
        </button>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="No active listings yet."
          cta="Create your first listing"
          to="/auctions/create"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f2f4f6]">
                {['Item Details', 'Current Bid', 'Bids', 'Remaining', ''].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 font-[Inter] text-[10px] font-bold uppercase tracking-widest text-[#464555]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c7c4d8]/10">
              {listings.map((row) => (
                <tr key={row.id} className="hover:bg-[#f2f4f6]/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-[#eceef0] shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#777587] text-xl">image</span>
                      </div>
                      <span className="font-[Manrope] font-bold text-sm text-[#191c1e]">
                        {row.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-[Plus_Jakarta_Sans] font-bold text-[#3525cd]">
                    {row.currentBid}
                  </td>
                  <td className="px-6 py-4 font-[Inter] text-sm text-[#464555]">
                    {row.bids}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[11px] font-bold font-[Inter] rounded-full border ${timePill[row.timeStatus]}`}>
                      {row.timeLeft}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionMenu listingId={row.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}