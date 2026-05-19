// src/pages/seller-dashboard/StatsRow.tsx

import { GlassCard } from './ui';
import type { StatCard } from './types';

interface Props {
  stats: StatCard[];
}

export default function StatsRow({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, trend, up }) => (
        <GlassCard key={label} className="p-6">
          <p className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-[#464555] mb-2">
            {label}
          </p>
          <div className="flex items-end justify-between gap-2">
            <span className="font-[Plus_Jakarta_Sans] text-2xl font-extrabold text-[#191c1e] leading-none">
              {value}
            </span>
            <span
              className={`flex items-center gap-0.5 text-[11px] font-bold font-[Inter] px-2 py-0.5 rounded ${
                up ? 'bg-[#006c49]/10 text-[#006c49]' : 'bg-[#960014]/10 text-[#960014]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {up ? 'trending_up' : 'trending_down'}
              </span>
              {trend}
            </span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}