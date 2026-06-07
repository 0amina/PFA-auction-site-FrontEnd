// src/pages/admin/DashboardPage.tsx
// Route: /admin (index). Overview of the platform.
// Swap the mock constants for real counts from your gateway (admin endpoints).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthFetch } from '../../hooks/useAuthFetch';
import { normalizeAuction, type BackendAuction } from '../../lib/api';

interface Stats {
  totalUsers: number;
  activeAuctions: number;
  endedAuctions: number;
  pendingRequests: number;
  activeTND: number;
  activeSOL: number;
}

const EMPTY_STATS: Stats = {
  totalUsers: 0, activeAuctions: 0, endedAuctions: 0, pendingRequests: 0, activeTND: 0, activeSOL: 0,
};

const MONTHLY = [
  { m: 'Jan', v: 18 }, { m: 'Feb', v: 24 }, { m: 'Mar', v: 21 },
  { m: 'Apr', v: 32 }, { m: 'May', v: 28 }, { m: 'Jun', v: 42 },
];

const ACTIVITY = [
  { icon: 'emoji_events',  tint: 'text-secondary', bg: 'bg-secondary/10', title: 'Auction won',    text: 'Vintage Rolex Submariner sold for ◎14.2 SOL.', time: '2 min ago' },
  { icon: 'verified_user', tint: 'text-primary',   bg: 'bg-primary/10',   title: 'Seller request', text: 'Atelier Nord applied for seller access.',       time: '18 min ago' },
  { icon: 'add_box',       tint: 'text-primary',   bg: 'bg-primary/10',   title: 'New listing',    text: 'Persian Silk Rug listed — 2 350 TND start.',    time: '42 min ago' },
  { icon: 'block',         tint: 'text-tertiary',  bg: 'bg-tertiary/10',  title: 'User banned',    text: 'Buyer #8291 banned for payment fraud.',         time: '1 h ago' },
  { icon: 'group_add',     tint: 'text-secondary', bg: 'bg-secondary/10', title: 'New buyers',     text: '5 new buyers registered today.',                time: '3 h ago' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, chip, chipCls, iconTint, iconBg }: {
  icon: string; value: string; label: string; chip: string; chipCls: string; iconTint: string; iconBg: string;
}) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl editorial-shadow flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${iconBg} ${iconTint}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className={`font-label text-xs font-bold px-2 py-1 rounded-full ${chipCls}`}>{chip}</span>
      </div>
      <div>
        <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
        <p className="font-headline font-bold text-3xl">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const max = Math.max(...MONTHLY.map((d) => d.v));
  const authFetch = useAuthFetch();
  const [STATS, setStats] = useState<Stats>(EMPTY_STATS);

  useEffect(() => {
    let alive = true;
    (async () => {
      const next = { ...EMPTY_STATS };
      try {
        const usersRes = await authFetch('/user/admin/all-users');
        if (usersRes.ok) next.totalUsers = ((await usersRes.json()) as unknown[]).length;
      } catch { /* ignore */ }
      try {
        const reqRes = await authFetch('/user/admin/seller-requests');
        if (reqRes.ok) {
          const rows: { status: string }[] = await reqRes.json();
          next.pendingRequests = rows.filter((r) => r.status === 'pending').length;
        }
      } catch { /* ignore */ }
      try {
        const monRes = await authFetch('/auctions/admin/monitor');
        if (monRes.ok) {
          const data: { auctions: BackendAuction[] } = await monRes.json();
          const auctions = (data.auctions ?? []).map(normalizeAuction);
          const active = auctions.filter((a) => a.rawStatus === 'active');
          next.activeAuctions = active.length;
          next.endedAuctions = auctions.filter((a) =>
            ['ended', 'awaiting', 'confirmed'].includes(a.rawStatus),
          ).length;
          next.activeTND = active.filter((a) => a.bidMethod === 'TND').length;
          next.activeSOL = active.filter((a) => a.bidMethod === 'SOL').length;
        }
      } catch { /* ignore */ }
      if (alive) setStats(next);
    })();
    return () => { alive = false; };
  }, [authFetch]);

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <h2 className="font-headline font-extrabold text-4xl tracking-tight mb-1">Ecosystem Overview</h2>
        <p className="text-on-surface-variant font-body">Real-time platform metrics and governance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon="group"           value={STATS.totalUsers.toLocaleString()} label="Total Users"            chip="+12%"   chipCls="text-secondary bg-secondary/10"             iconTint="text-primary"          iconBg="bg-primary/10" />
        <StatCard icon="gavel"           value={String(STATS.activeAuctions)}      label="Active Auctions"        chip="Live"   chipCls="text-secondary bg-secondary/10"             iconTint="text-secondary"        iconBg="bg-secondary/10" />
        <StatCard icon="event_available" value={STATS.endedAuctions.toLocaleString()} label="Ended Auctions"      chip="Lifetime" chipCls="text-on-surface-variant bg-surface-container-high" iconTint="text-on-surface-variant" iconBg="bg-surface-container-high" />
        <StatCard icon="pending_actions" value={String(STATS.pendingRequests)}     label="Pending Seller Requests" chip="Action" chipCls="text-tertiary bg-tertiary/10"               iconTint="text-tertiary"         iconBg="bg-tertiary/10" />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Activity bar chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-2xl editorial-shadow">
          <div className="mb-8">
            <h3 className="font-headline font-bold text-xl mb-1">New auctions</h3>
            <p className="text-sm text-on-surface-variant">Listings created per month (last 6 months)</p>
          </div>

          <div className="flex items-end gap-3 h-48">
            {MONTHLY.map((d, i) => (
              <div key={d.m} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex items-end h-full">
                  <div
                    className={`w-full rounded-t-lg transition-all ${i === MONTHLY.length - 1 ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'}`}
                    style={{ height: `${(d.v / max) * 100}%` }}
                    title={`${d.v} auctions`}
                  />
                </div>
                <span className="font-label text-[11px] text-on-surface-variant">{d.m}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-4 gap-4 border-t border-outline-variant/10 pt-6">
            <Metric label="Active TND" value={`${STATS.activeTND}`} />
            <Metric label="Active SOL" value={`${STATS.activeSOL}`} />
            <Metric label="Avg bids / lot" value="6.4" />
            <Metric label="New sellers (7d)" value="+9" />
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl editorial-shadow flex flex-col">
          <h3 className="font-headline font-bold text-xl mb-6">Recent Activity</h3>
          <div className="flex flex-col gap-5 flex-1">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.bg} ${a.tint}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface">{a.title}</p>
                  <p className="text-xs text-on-surface-variant leading-snug">{a.text}</p>
                  <span className="text-[10px] text-outline font-label uppercase">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Needs attention */}
      <div className="mt-8 bg-primary/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface">{STATS.pendingRequests} seller requests awaiting review</p>
            <p className="text-sm text-on-surface-variant">Approve or reject applications to keep the queue moving.</p>
          </div>
        </div>
        <Link
          to="/admin/seller-requests"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm rounded-full hover:brightness-110 active:scale-95 transition-all shrink-0"
        >
          Review requests
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant">{label}</span>
      <span className="font-headline font-bold text-lg">{value}</span>
    </div>
  );
}
