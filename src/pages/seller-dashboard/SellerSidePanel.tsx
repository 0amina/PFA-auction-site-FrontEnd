// src/pages/seller-dashboard/SellerSidePanel.tsx
// Right-column panel: Quick Actions, Pending Reviews, Earnings Summary.
// Kept in one file because they only ever appear together in the sidebar column.

import { Link } from 'react-router-dom';
import { GlassCard } from './ui';
import type { PendingItem, EarningsSegment } from './types';

// ─── Quick Actions ─────────────────────────────────────────────────────────────

function QuickActions() {
  return (
    <GlassCard className="p-6">
      <h2 className="font-[Plus_Jakarta_Sans] text-base font-bold text-[#191c1e] mb-4">
        Quick Actions
      </h2>
      <div className="space-y-2.5">
        <Link
          to="/auctions/create"
          className="w-full py-3.5 px-5 bg-gradient-to-r from-[#3525cd] to-[#4f46e5] text-white
            rounded-xl font-[Plus_Jakarta_Sans] font-bold text-sm flex items-center justify-between
            hover:opacity-90 active:scale-[0.98] transition-all group"
        >
          <span>Create New Listing</span>
          <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform">
            add_circle
          </span>
        </Link>
        {[
          { label: 'View Analytics', icon: 'insights',              to: '/seller/analytics' },
          { label: 'Manage Payouts', icon: 'account_balance_wallet', to: '/seller/payouts'   },
        ].map(({ label, icon, to }) => (
          <Link
            key={label}
            to={to}
            className="w-full py-3.5 px-5 bg-[#f2f4f6] text-[#191c1e] rounded-xl
              font-[Plus_Jakarta_Sans] font-bold text-sm flex items-center justify-between
              border border-[#c7c4d8]/10 hover:bg-[#e6e8ea] transition-colors"
          >
            <span>{label}</span>
            <span className="material-symbols-outlined text-[#464555]">{icon}</span>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}

// ─── Pending Reviews ──────────────────────────────────────────────────────────

function PendingReviews({ items }: { items: PendingItem[] }) {
  return (
    <GlassCard className="p-6">
      <h2 className="font-[Plus_Jakarta_Sans] text-base font-bold text-[#191c1e] mb-4">
        Pending Reviews
      </h2>
      {items.length === 0 ? (
        <p className="font-[Manrope] text-sm text-[#464555] text-center py-4">
          No items pending review.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map(({ title, sub, chip, chipColor }) => (
            <div
              key={title}
              className="flex items-center gap-3 p-3 bg-[#f2f4f6]/60 rounded-lg border border-[#c7c4d8]/10"
            >
              <div className="w-10 h-10 rounded-lg bg-[#eceef0] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#777587] text-lg">image</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[Manrope] text-xs font-bold text-[#191c1e] truncate">{title}</p>
                <p className="font-[Inter] text-[10px] text-[#464555]">{sub}</p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-bold font-[Inter] px-2 py-1 rounded ${
                  chipColor === 'amber'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-[#3525cd]/10 text-[#3525cd]'
                }`}
              >
                {chip}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ─── Earnings Summary ─────────────────────────────────────────────────────────

function EarningsSummary({ segments }: { segments: EarningsSegment[] }) {
  return (
    <GlassCard className="p-6">
      <h2 className="font-[Plus_Jakarta_Sans] text-base font-bold text-[#191c1e] mb-1">
        Earnings Summary
      </h2>
      <p className="font-[Inter] text-xs text-[#006c49] font-bold mb-6">↑ Monthly Growth +14%</p>

      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="#eceef0" strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="#3525cd" strokeWidth="3" strokeDasharray="75, 100"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="#4edea3" strokeWidth="3"
              strokeDasharray="15, 100" strokeDashoffset="-75"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-[Plus_Jakarta_Sans] text-xl font-extrabold text-[#191c1e]">42k TND</span>
            <span className="font-[Inter] text-[9px] text-[#464555] uppercase tracking-wider">This Month</span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {segments.map(({ dot, label, pct }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
              <span className="font-[Inter] text-[#191c1e]">{label}</span>
            </div>
            <span className="font-[Inter] font-bold text-[#191c1e]">{pct}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─── Composed panel ───────────────────────────────────────────────────────────

interface Props {
  pendingItems:     PendingItem[];
  earningsSegments: EarningsSegment[];
}

export default function SellerSidePanel({ pendingItems, earningsSegments }: Props) {
  return (
    <div className="space-y-6">
      <QuickActions />
      <PendingReviews items={pendingItems} />
      <EarningsSummary segments={earningsSegments} />
    </div>
  );
}