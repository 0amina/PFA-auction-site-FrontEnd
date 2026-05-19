// src/pages/seller-dashboard/BidFeed.tsx

import { GlassCard, EmptyState } from './ui';
import type { BidEntry } from './types';

interface Props {
  bids: BidEntry[];
}

export default function BidFeed({ bids }: Props) {
  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-[Plus_Jakarta_Sans] text-lg font-bold text-[#191c1e]">
          Recent Bids Activity
        </h2>
        <span className="material-symbols-outlined text-[#464555]">history</span>
      </div>

      {bids.length === 0 ? (
        <EmptyState icon="gavel" title="No bids received yet." />
      ) : (
        <div className="space-y-5">
          {bids.map(({ name, initials, item, amount, time }) => (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3525cd] to-[#4f46e5]
                  flex items-center justify-center text-white text-xs font-black font-[Inter] shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-[Manrope] text-sm font-bold text-[#191c1e]">
                    {name} placed a bid on{' '}
                    <span className="text-[#3525cd] hover:underline cursor-pointer">{item}</span>
                  </p>
                  <p className="font-[Inter] text-xs text-[#464555]">{time}</p>
                </div>
              </div>
              <span className="font-[Plus_Jakarta_Sans] text-sm font-bold text-[#006c49] shrink-0">
                {amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}