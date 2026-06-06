// src/pages/admin/SellerRequestsPage.tsx
// Route: /admin/seller-requests. Buyers applying to become sellers.
// Approve → role becomes SELLER (server-side). Reject → application closed.
// Both actions remove the card from the queue (wire to the gateway).

import { useState } from 'react';

interface SellerRequest {
  id: string;
  name: string;
  email: string;
  appliedAt: string;
  category: string;   // what they plan to sell
  note: string;
}

const INITIAL: SellerRequest[] = [
  { id: 'REQ-1042', name: 'Atelier Nord',    email: 'hello@ateliernord.tn',   appliedAt: '04 Jun 2026', category: 'Fine Art',   note: 'Independent gallery, 60+ original works to list.' },
  { id: 'REQ-1041', name: 'Karim Belhadj',   email: 'k.belhadj@gmail.com',    appliedAt: '03 Jun 2026', category: 'Watches',    note: 'Private collector specialising in vintage dive watches.' },
  { id: 'REQ-1040', name: 'Maison Vintage',  email: 'contact@maisonvintage.fr', appliedAt: '02 Jun 2026', category: 'Furniture', note: 'Mid-century dealer, ships across the EU.' },
  { id: 'REQ-1039', name: 'Sami Trabelsi',   email: 'sami.t@outlook.com',     appliedAt: '01 Jun 2026', category: 'Books',      note: 'Rare first editions and manuscripts.' },
];

export default function SellerRequestsPage() {
  const [requests, setRequests] = useState<SellerRequest[]>(INITIAL);
  const [approved, setApproved] = useState(142);
  const [rejected, setRejected] = useState(0);

  function decide(id: string, action: 'approve' | 'reject') {
    // TODO: POST /admin/seller-requests/:id/approve | /reject via the gateway.
    // Approve flips the user's role to SELLER server-side.
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (action === 'approve') setApproved((n) => n + 1);
    else setRejected((n) => n + 1);
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="font-headline font-extrabold text-4xl tracking-tight">Seller Requests</h2>
          <p className="text-on-surface-variant font-body mt-2">Review buyers applying for seller access.</p>
        </div>
        <div className="flex gap-3">
          <Chip dot="bg-[#d97706]" label={`${requests.length} Pending`} />
          <Chip dot="bg-secondary" label={`${approved} Approved`} />
          {rejected > 0 && <Chip dot="bg-tertiary" label={`${rejected} Rejected`} />}
        </div>
      </div>

      {/* Queue */}
      <div className="grid grid-cols-1 gap-4">
        {requests.map((r) => {
          const initials = r.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
          return (
            <div key={r.id} className="bg-surface-container-lowest p-6 rounded-2xl editorial-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-sm font-black font-label shrink-0">{initials}</div>
                <div className="min-w-0">
                  <h3 className="font-headline font-bold text-lg text-on-surface">{r.name}</h3>
                  <p className="font-body text-sm text-on-surface-variant truncate">{r.note}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-[10px] font-label text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded uppercase tracking-wide">{r.category}</span>
                    <span className="text-xs font-label text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      Applied {r.appliedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="hidden lg:block text-right">
                  <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant opacity-60 mb-1">Status</p>
                  <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full" style={{ color: '#b45309', backgroundColor: '#fef3c7' }}>Pending</span>
                </div>
                <div className="h-10 w-px bg-outline-variant/20 hidden md:block" />
                <div className="flex items-center gap-2">
                  <button onClick={() => decide(r.id, 'reject')} className="bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-on-tertiary px-6 py-2.5 rounded-xl font-bold font-label text-xs uppercase tracking-wide transition-all">Reject</button>
                  <button onClick={() => decide(r.id, 'approve')} className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-2.5 rounded-xl font-bold font-label text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all">Approve</button>
                </div>
              </div>
            </div>
          );
        })}

        {requests.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '30px', fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-on-surface mb-1.5">Queue cleared</h3>
            <p className="font-body text-sm text-on-surface-variant">No seller requests are waiting for review.</p>
          </div>
        )}
      </div>

      {/* Insight strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 bg-primary/5 p-8 rounded-2xl relative overflow-hidden">
          <h4 className="font-headline font-bold text-2xl text-primary mb-2">Weekly throughput</h4>
          <p className="text-on-surface-variant text-sm max-w-sm">Approvals are up this week. Keep vetting standards high before granting seller access.</p>
          <div className="mt-8 flex items-end gap-2">
            {[12, 24, 16, 32, 20, 28].map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-lg ${i === 3 ? 'bg-primary' : 'bg-primary/20'}`} style={{ height: `${h * 2}px` }} />
            ))}
          </div>
        </div>
        <div className="bg-surface-container-highest p-8 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
            <span className="material-symbols-outlined text-3xl">schedule</span>
          </div>
          <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant font-bold">Avg. response time</p>
          <p className="font-headline font-extrabold text-4xl text-on-surface mt-1">4.2h</p>
          <p className="text-xs text-secondary font-bold mt-2">Within target</p>
        </div>
      </div>
    </div>
  );
}

function Chip({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="bg-surface-container-low px-4 py-2 rounded-xl flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="text-xs font-label uppercase tracking-widest font-bold">{label}</span>
    </div>
  );
}
