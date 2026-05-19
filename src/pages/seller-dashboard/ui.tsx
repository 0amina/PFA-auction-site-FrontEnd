// src/pages/seller-dashboard/ui.tsx
// Tiny shared primitives — GlassCard, EmptyState, ActionMenu.
// Keep here so each section component stays focused on its own logic.

import { useState } from 'react';
import { Link }     from 'react-router-dom';

// ─── GlassCard ────────────────────────────────────────────────────────────────

export function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-2xl border border-[#c7c4d8]/15 rounded-xl
        transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  cta,
  to,
}: {
  icon: string;
  title: string;
  cta?: string;
  to?: string;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center px-6">
      <span className="material-symbols-outlined text-4xl text-[#c7c4d8] mb-3">{icon}</span>
      <p className="font-[Manrope] text-sm text-[#464555] mb-4">{title}</p>
      {cta && to && (
        <Link
          to={to}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#3525cd] text-white
            text-sm font-bold font-[Plus_Jakarta_Sans] rounded-full hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          {cta}
        </Link>
      )}
    </div>
  );
}

// ─── ActionMenu ───────────────────────────────────────────────────────────────

export function ActionMenu({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="material-symbols-outlined text-[#464555] hover:text-[#3525cd] transition-colors"
      >
        more_vert
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-40 bg-white rounded-xl shadow-xl
            border border-[#c7c4d8]/20 overflow-hidden py-1">
            {['Edit', 'End Early', 'View'].map((action) => (
              <button
                key={action}
                onClick={() => setOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm font-[Inter] font-medium
                  text-[#191c1e] hover:bg-[#f2f4f6] transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}