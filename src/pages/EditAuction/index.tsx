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
import type { AuctionCategory, AuctionDuration, ConditionGrade } from '../../types/auction';

// ─── Mock auction fetch — replace with your real auctionService.getById(id) ──
// Returns a shape identical to what the API would return.
function useMockAuction(id: string) {
  const [data, setData]     = useState<EditFormState | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'active' | 'ended'>('draft');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        title:          'Handcrafted Antique Ceramic Vase',
        description:    'Carefully preserved over the years, the vase showcases detailed hand-painted patterns with a glossy porcelain finish.',
        category:       'Fine Art' as AuctionCategory,
        provenance:     '19th Century',
        reservePrice:   800,
        startingBid:    500,
        duration:       '7 Days' as AuctionDuration,
        startDate:      '2026-06-15T10:00',
        conditionGrade: 'Excellent' as ConditionGrade,
        location:       'Tunis, Tunisia',
        bidMethod:      'TND',
        walletConnected: false,
        walletAddress:  '',
      });
      setImages([
        'https://feahome.com/cdn/shop/products/YN7048_Chinesehand-craftedFloralVaseIncisedDecorationIntricateDesign_1200_4.jpg?v=1655134134',
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400',
      ]);
      setStatus('draft');
      setLoading(false);
    }, 600);
  }, [id]);

  return { data, images, setImages, status, loading };
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

  const { data, images: existingImages, setImages, status, loading } = useMockAuction(id ?? '');

  const [images, setLocalImages]     = useState<string[]>([]);
  const [showDelete, setShowDelete]  = useState(false);
  const [saveStatus, setSaveStatus]  = useState<'idle' | 'saving' | 'saved'>('idle');

  // Seed images once data loads
  useEffect(() => {
    if (existingImages.length) setLocalImages(existingImages);
  }, [existingImages]);

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
    images={images}
    onImagesChange={setLocalImages}
    status={status}
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
  id, initialForm, images, onImagesChange,
  status, showDelete, setShowDelete,
  saveStatus, setSaveStatus, navigate,
}: {
  id:              string;
  initialForm:     EditFormState;
  images:          string[];
  onImagesChange:  (u: string[]) => void;
  status:          'draft' | 'active' | 'ended';
  showDelete:      boolean;
  setShowDelete:   (v: boolean) => void;
  saveStatus:      'idle' | 'saving' | 'saved';
  setSaveStatus:   (v: 'idle' | 'saving' | 'saved') => void;
  navigate:        ReturnType<typeof useNavigate>;
}) {
  const { form, setField, isValid } = useEditFormState(initialForm);
  const isLocked = status === 'active' || status === 'ended';

  const handleUpdate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLocked) return;
    setSaveStatus('saving');
    // TODO: auctionService.update(id, { ...form, imageUrls: images })
    console.log('Update auction', id, { ...form, imageUrls: images });
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 1200);
  }, [form, images, id, isValid, isLocked]);

  const handleDelete = useCallback(() => {
    // TODO: auctionService.delete(id)
    console.log('Delete auction', id);
    navigate('/my-auctions');
  }, [id, navigate]);

  const handleSaveDraft = useCallback(() => {
    // TODO: auctionService.saveDraft(id, { ...form, imageUrls: images })
    console.log('Save draft', id, { ...form, imageUrls: images });
  }, [form, images, id]);

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
            images={images}
            onImagesChange={onImagesChange}
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
