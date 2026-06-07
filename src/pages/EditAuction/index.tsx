// src/pages/EditAuctionPage/index.tsx
// Edit an existing auction.
// Route: /auctions/:id/edit  (add to AppRouter — see bottom comment)
//
// Differences from CreateAuctionPage:
//  - useParams to read :id
//  - Mock fetch (replace with useAuction(id)) pre-fills the form
//  - Submit calls UPDATE (PATCH) not CREATE (POST)
//  - Extra "Delete Auction" danger action
//  - Image list is seeded with existing images
//  - Header says "Edit Lot" + lot number
//  - Read-only badge if auction is already live/ended

import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEditFormState, type EditFormState } from './useEditFormState';
import EditAuctionForm from './EditAuctionForm';
import TipsSidebar from '../CreateAuctionPage/TipsSidebar'; // reuse existing sidebar
import type { AuctionCategory, ConditionGrade } from '../../types/auction';
import { request, normalizeAuction, type BackendAuction, type UiAuction } from '../../lib/api';
import { useAuthFetch } from '../../hooks/useAuthFetch';

// Backend enum → editorial category (best-effort; falls back to 'Fine Art').
const CATEGORY_TO_EDITORIAL: Record<string, AuctionCategory> = {
  art: 'Fine Art', jewelry: 'Jewelry', vehicles: 'Automobiles', collectibles: 'Timepieces',
};
const CONDITION_TO_GRADE: Record<string, ConditionGrade> = {
  new: 'Mint (As New)', like_new: 'Excellent', used: 'Good (Shows Wear)', damaged: 'Fair (Functional)',
};

function toEditForm(a: UiAuction): EditFormState {
  return {
    title:          a.title,
    description:    a.description,
    category:       CATEGORY_TO_EDITORIAL[a.category] ?? 'Fine Art',
    provenance:     '',
    reservePrice:   a.reservePrice ?? '',
    startingBid:    a.startingBid,
    duration:       '7 Days',
    startDate:      a.endTime ? a.endTime.slice(0, 16) : '',
    conditionGrade: CONDITION_TO_GRADE[a.condition ?? ''] ?? 'Excellent',
    location:       '',
    bidMethod:      a.bidMethod,
    walletConnected: a.bidMethod === 'TND' || !!a.sellerWallet,
    walletAddress:  a.sellerWallet ?? '',
  };
}

// Real fetch via gateway → auction-service.
function useAuctionForEdit(id: string) {
  const [data, setData] = useState<EditFormState | null>(null);
  const [status, setStatus] = useState<'draft' | 'active' | 'ended'>('draft');
  // Editing is locked only once bidding/escrow has actually begun — this mirrors
  // the auction-service rules (TND: after the first bid, SOL: after on-chain
  // escrow, or any ended/settled auction). A live auction with no bids is still
  // editable, so it must NOT disable the form.
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const raw = await request<BackendAuction>(`/auctions/${id}`, { auth: false });
        const a = normalizeAuction(raw);
        if (!alive) return;
        setData(toEditForm(a));
        setStatus(a.rawStatus === 'active' ? 'active' : a.status === 'closed' ? 'ended' : 'draft');
        setLocked(
          a.status === 'closed' ||
          (a.bidMethod === 'TND' && a.bidCount > 0) ||
          (a.bidMethod === 'SOL' && !!a.escrowAddress),
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  return { data, status, locked, loading };
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'draft' | 'active' | 'ended' }) {
  const map = {
    draft:  { label: 'Draft',  bg: 'bg-surface-container',    text: 'text-on-surface-variant', icon: 'edit_note'   },
    active: { label: 'Live',   bg: 'bg-green-50',              text: 'text-green-700',          icon: 'radio_button_checked' },
    ended:  { label: 'Ended',  bg: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: 'lock'       },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-label ${s.bg} ${s.text}`}>
      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
      {s.label}
    </span>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────
function DeleteModal({ lotTitle, onConfirm, onCancel }: {
  lotTitle:  string;
  onConfirm: () => void;
  onCancel:  () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600">delete_forever</span>
          </div>
          <h3 className="font-headline font-bold text-xl text-on-surface">Delete Auction?</h3>
        </div>
        <p className="font-body text-on-surface-variant mb-2">
          You're about to permanently delete:
        </p>
        <p className="font-body font-bold text-on-surface mb-6 bg-surface-container-low rounded-xl px-4 py-3">
          "{lotTitle}"
        </p>
        <p className="font-body text-sm text-on-surface-variant mb-8">
          This action cannot be undone. All bids placed on this auction will be voided and bidders will be notified.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-surface-container-high text-on-surface font-headline font-bold rounded-xl hover:bg-surface-variant transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 text-white font-headline font-bold rounded-xl hover:bg-red-700 active:scale-95 transition-all"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EditAuctionPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, status, locked, loading } = useAuctionForEdit(id ?? '');

  const [showDelete, setShowDelete]  = useState(false);
  const [saveStatus, setSaveStatus]  = useState<'idle' | 'saving' | 'saved'>('idle');

  // Only initialise the form once data has loaded
  if (loading || !data) {
    return (
      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-pulse">hourglass_top</span>
          <p className="font-body text-on-surface-variant">Loading auction details…</p>
        </div>
      </main>
    );
  }

  return <EditAuctionPageInner
    id={id ?? ''}
    initialForm={data}
    status={status}
    locked={locked}
    showDelete={showDelete}
    setShowDelete={setShowDelete}
    saveStatus={saveStatus}
    setSaveStatus={setSaveStatus}
    navigate={navigate}
  />;
}

// Inner component — only rendered after data is ready, so useEditFormState
// gets the real initial values instead of empty strings.
function EditAuctionPageInner({
  id, initialForm,
  status, locked, showDelete, setShowDelete,
  saveStatus, setSaveStatus, navigate,
}: {
  id:              string;
  initialForm:     EditFormState;
  status:          'draft' | 'active' | 'ended';
  locked:          boolean;
  showDelete:      boolean;
  setShowDelete:   (v: boolean) => void;
  saveStatus:      'idle' | 'saving' | 'saved';
  setSaveStatus:   (v: 'idle' | 'saving' | 'saved') => void;
  navigate:        ReturnType<typeof useNavigate>;
}) {
  const { form, setField, isValid } = useEditFormState(initialForm);
  const authFetch = useAuthFetch();
  const isLocked = locked;

  // Editorial values → backend enums (mirror createAuction.ts).
  const toBackendCategory = (c: string) =>
    ({ 'Timepieces': 'collectibles', 'Fine Art': 'art', 'Jewelry': 'jewelry', 'Automobiles': 'vehicles', 'Rare Coins': 'collectibles' } as Record<string, string>)[c];
  const toBackendCondition = (c: string) =>
    ({ 'Mint (As New)': 'new', 'Excellent': 'like_new', 'Good (Shows Wear)': 'used', 'Restored': 'used', 'Fair (Functional)': 'damaged' } as Record<string, string>)[c];

  const persist = useCallback(async () => {
    setSaveStatus('saving');
    const body: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      category: toBackendCategory(form.category),
      condition: toBackendCondition(form.conditionGrade),
    };
    if (form.startingBid !== '') body.startingPrice = Number(form.startingBid);
    if (form.reservePrice !== '') body.reservePrice = Number(form.reservePrice);

    const res = await authFetch(`/auctions/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    if (res.ok) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } else {
      const err = await res.json().catch(() => ({}));
      setSaveStatus('idle');
      alert(err.message ?? 'Could not save changes.');
    }
  }, [form, id, authFetch, setSaveStatus]);

  const handleUpdate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLocked) return;
    void persist();
  }, [isValid, isLocked, persist]);

  const handleDelete = useCallback(async () => {
    const res = await authFetch(`/auctions/${id}`, { method: 'DELETE' });
    if (res.ok) navigate('/my-auctions');
    else alert('Could not delete this auction.');
  }, [id, navigate, authFetch]);

  const handleSaveDraft = useCallback(() => { void persist(); }, [persist]);

  return (
    <>
      {showDelete && (
        <DeleteModal
          lotTitle={form.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      <main className="pt-8 pb-24 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        <div className="flex-grow max-w-3xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 font-label text-sm text-on-surface-variant">
            <Link to="/my-auctions" className="hover:text-primary transition-colors">My Auctions</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface font-semibold truncate max-w-xs">{form.title || `Lot #${id}`}</span>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-5xl font-headline font-extrabold text-on-surface tracking-tight">
                Edit Lot
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-on-surface-variant font-body text-lg leading-relaxed">
              {isLocked
                ? 'This auction is currently live. Only limited fields can be modified while bidding is in progress.'
                : 'Update the details below. Changes will be saved and reflected immediately on the listing.'}
            </p>

            {/* Live warning banner */}
            {isLocked && (
              <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="material-symbols-outlined text-amber-600 shrink-0">warning</span>
                <p className="text-sm font-body text-amber-800">
                  <strong>Auction is live.</strong> Price fields, bid method, and start date are locked.
                  You can still update the description, condition, and location.
                </p>
              </div>
            )}
          </header>

          <EditAuctionForm
            form={form}
            setField={setField}
            isValid={isValid}
            isLocked={isLocked}
            onSubmit={handleUpdate}
            onSaveDraft={handleSaveDraft}
            saveStatus={saveStatus}
            onDeleteClick={() => setShowDelete(true)}
          />
        </div>

        <TipsSidebar />
      </main>
    </>
  );
}
