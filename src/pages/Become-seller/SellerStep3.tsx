// src/pages/become-seller/SellerStep3.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthFetch } from '../../hooks/useAuthFetch';
import type { Step1Data } from './SellerStep1';
import type { Step2Data } from './SellerStep2';

interface Props {
  step1: Step1Data;
  step2: Step2Data;
  onBack: () => void;
  onGoToStep: (step: 1 | 2) => void;
}

const EXPERIENCE_LABELS = ['0–1 Year', '1–3 Years', '3–5 Years', '5+ Years'];

const SELLER_TERMS = `
1. Introduction
As a seller on The Curator, you enter into a binding legal agreement. This document outlines the standards for provenance, shipping excellence, and the auction process. We maintain a high bar to ensure the integrity of our marketplace.

2. Authenticity Guarantee
Sellers are solely responsible for verifying the authenticity of all items. Failure to provide accurate provenance may result in permanent suspension and legal liability. Each listing must include high-resolution photography and a detailed physical condition report.

3. Transaction Fees
The Curator collects a 12% commission on the hammer price of all successful auctions. Fees are deducted before payout. Payouts are initiated within 7 business days after the buyer's payment is cleared and delivery is confirmed.

4. Shipping & Handling
High-value items must be shipped via white-glove art handling services. Sellers are expected to insure items for their full final sale value during transit.

5. Dispute Resolution
Any disputes between buyers and sellers will be mediated by The Curator's curation board. The board's decision is final and binding on both parties.
`.trim();

export default function SellerStep3({ step1, step2, onBack, onGoToStep }: Props) {
  const [agreedTerms,   setAgreedTerms]   = useState(false);
  const [agreedAccuracy, setAgreedAccuracy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authFetch = useAuthFetch();
  const navigate  = useNavigate();

  const canSubmit = agreedTerms && agreedAccuracy && !loading;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/user/request-seller', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Request failed');
      }
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="w-20 h-20 rounded-full bg-[#006c49]/10 flex items-center justify-center mb-6 animate-[scaleIn_0.4s_ease]">
          <span
            className="material-symbols-outlined text-[42px] text-[#006c49]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            task_alt
          </span>
        </div>
        <h2 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-[#191c1e] mb-3">
          Application Submitted
        </h2>
        <p className="text-[#464555] font-[Manrope] max-w-sm mb-8 leading-relaxed">
          Our curation board will review your application within 24–48 hours. You'll be notified by email once a decision is made.
        </p>
        <button
          onClick={() => navigate('/profile')}
          className="px-10 py-3 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#4f46e5]
            text-white font-[Plus_Jakarta_Sans] font-bold text-sm shadow-lg
            hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-[#191c1e] mb-2">
          Review &amp; Agreement
        </h1>
        <p className="text-[#464555] font-[Manrope] leading-relaxed">
          Confirm your details and acknowledge our terms to finalize your seller application.
        </p>
      </header>

      <div className="space-y-8">
        {/* Review Summary */}
        <section className="space-y-3">
          <h2 className="font-[Plus_Jakarta_Sans] text-sm font-bold text-[#191c1e] uppercase tracking-widest mb-4">
            Review Summary
          </h2>

          {/* Identity card */}
          <div className="bg-[#f2f4f6]/50 hover:bg-[#f2f4f6] rounded-xl p-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-[#464555]">
                Profile &amp; Identity
              </h3>
              <button
                type="button"
                onClick={() => onGoToStep(1)}
                className="font-[Inter] text-xs font-bold text-[#3525cd] hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-[#464555] font-[Manrope]">Shop Name</dt>
              <dd className="font-semibold text-[#191c1e] font-[Manrope]">{step1.shopName || '—'}</dd>
              <dt className="text-[#464555] font-[Manrope]">Seller Type</dt>
              <dd className="font-semibold text-[#191c1e] font-[Manrope] capitalize">{step1.sellerType}</dd>
              {step1.sellerType === 'business' && (
                <>
                  <dt className="text-[#464555] font-[Manrope]">Business Name</dt>
                  <dd className="font-semibold text-[#191c1e] font-[Manrope]">{step1.businessName || '—'}</dd>
                  <dt className="text-[#464555] font-[Manrope]">Tax ID</dt>
                  <dd className="font-semibold text-[#191c1e] font-[Manrope]">{'•••• ' + (step1.taxId.slice(-4) || '????')}</dd>
                </>
              )}
              <dt className="text-[#464555] font-[Manrope]">Country</dt>
              <dd className="font-semibold text-[#191c1e] font-[Manrope] uppercase">{step1.country || '—'}</dd>
            </dl>
          </div>

          {/* Expertise card */}
          <div className="bg-[#f2f4f6]/50 hover:bg-[#f2f4f6] rounded-xl p-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-[#464555]">
                Auction Focus
              </h3>
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="font-[Inter] text-xs font-bold text-[#3525cd] hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-[#464555] font-[Manrope]">Categories</dt>
              <dd className="font-semibold text-[#191c1e] font-[Manrope] capitalize">
                {step2.categories.length > 0 ? step2.categories.join(', ') : '—'}
              </dd>
              <dt className="text-[#464555] font-[Manrope]">Experience</dt>
              <dd className="font-semibold text-[#191c1e] font-[Manrope]">
                {EXPERIENCE_LABELS[step2.experience]}
              </dd>
              <dt className="text-[#464555] font-[Manrope]">Monthly Listings</dt>
              <dd className="font-semibold text-[#191c1e] font-[Manrope]">{step2.monthlyListings}</dd>
            </dl>
            {step2.bio && (
              <p className="mt-4 pt-4 border-t border-[#e0e3e5] text-sm font-[Manrope] text-[#464555] leading-relaxed italic">
                "{step2.bio}"
              </p>
            )}
          </div>
        </section>

        {/* Terms */}
        <section>
          <h2 className="font-[Plus_Jakarta_Sans] text-sm font-bold text-[#191c1e] uppercase tracking-widest mb-4">
            Seller Agreement
          </h2>
          <div
            className="bg-[#f2f4f6]/30 border border-[#c7c4d8]/20 rounded-xl px-6 py-5 h-48 overflow-y-auto
              [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#c7c4d8] [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-track]:bg-transparent"
          >
            <div className="font-[Manrope] text-sm text-[#464555] leading-relaxed whitespace-pre-line">
              {SELLER_TERMS}
            </div>
          </div>
        </section>

        {/* Checkboxes */}
        <div className="space-y-4">
          {[
            {
              id: 'terms',
              checked: agreedTerms,
              onChange: setAgreedTerms,
              label: "I agree to The Curator's Seller Terms of Service and Commission Policy.",
            },
            {
              id: 'accuracy',
              checked: agreedAccuracy,
              onChange: setAgreedAccuracy,
              label: 'I confirm that all information provided in this application is accurate and verifiable.',
            },
          ].map(({ id, checked, onChange, label }) => (
            <label key={id} className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-[#c7c4d8] text-[#3525cd]
                  focus:ring-[#3525cd]/20 focus:ring-offset-0 transition-all cursor-pointer"
              />
              <span className="text-sm font-[Manrope] text-[#464555] group-hover:text-[#191c1e] transition-colors leading-relaxed">
                {label}
              </span>
            </label>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="flex items-center gap-2 text-sm font-[Inter] text-[#960014]">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={[
            'w-full h-14 rounded-xl font-[Plus_Jakarta_Sans] font-bold text-sm',
            'flex items-center justify-center gap-2 transition-all duration-300',
            canSubmit
              ? 'bg-gradient-to-r from-[#3525cd] to-[#4f46e5] text-white shadow-lg hover:opacity-90 active:scale-[0.98] cursor-pointer'
              : 'bg-[#3525cd]/25 text-white cursor-not-allowed',
          ].join(' ')}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              Submit Application
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] font-[Inter] text-[#464555]/50">
          Applications are reviewed within 24–48 hours by our curation board.
        </p>

        {/* Back */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 rounded-xl border border-[#c7c4d8]/50 text-[#464555]
              font-[Plus_Jakarta_Sans] font-bold text-sm hover:bg-[#f2f4f6] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}