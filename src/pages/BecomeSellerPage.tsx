// src/pages/BecomeSellerPage.tsx

import { useState } from 'react';
import SellerStepIndicator from '../components/SellerStepIndicator';
import SellerStep1, { type Step1Data } from './Become-seller/SellerStep1';
import SellerStep2, { type Step2Data } from './Become-seller/SellerStep2';
import SellerStep3 from './Become-seller/SellerStep3';

const DEFAULT_STEP1: Step1Data = {
  shopName: '',
  sellerType: 'individual',
  businessName: '',
  taxId: '',
  country: '',
  phoneCode: '+216',
  phone: '',
};

const DEFAULT_STEP2: Step2Data = {
  categories: [],
  experience: 0,
  monthlyListings: '1–5',
  bio: '',
};

export default function BecomeSellerPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1Data, setStep1Data] = useState<Step1Data>(DEFAULT_STEP1);
  const [step2Data, setStep2Data] = useState<Step2Data>(DEFAULT_STEP2);

  // Slide direction for animation
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const goNext = () => {
    setDirection('forward');
    setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  };

  const goBack = () => {
    setDirection('back');
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  };

  const goToStep = (target: 1 | 2) => {
    setDirection('back');
    setStep(target);
  };

  return (
    /*
     * This page renders inside MainLayout (Navbar + Sidebar + Footer already present).
     * The card is centered on the content area with max-w-2xl.
     */
    <div className="flex items-start justify-center px-4 py-12 min-h-[calc(100vh-64px)]">
      {/* Atmospheric blobs — pointer-events-none so they don't interfere */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#3525cd]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#006c49]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-2xl">
        {/* Pending banner — shown when user already has a pending application */}
        {/* Uncomment and wire to real status when available:
        {user?.role === 'pending_seller' && (
          <div className="mb-8 flex items-center gap-3 bg-[#e2dfff] border border-[#3525cd]/20 rounded-xl px-6 py-4">
            <span className="material-symbols-outlined text-[#3525cd]">hourglass_top</span>
            <p className="font-[Manrope] text-sm text-[#3525cd] font-semibold">
              Your application is under review. Our team will respond within 24–48 hours.
            </p>
          </div>
        )} */}

        <SellerStepIndicator currentStep={step} />

        {/* Glass card */}
        <div
          key={step}
          className={[
            'bg-white/80 backdrop-blur-2xl border border-[#c7c4d8]/15 rounded-xl shadow-xl',
            'p-8 md:p-12',
            // Simple fade+translate animation triggered by key change
            direction === 'forward'
              ? 'animate-[slideInFromRight_0.25s_ease]'
              : 'animate-[slideInFromLeft_0.25s_ease]',
          ].join(' ')}
          style={{
            // Inline keyframes via CSS custom property trick — works with Tailwind arbitrary values
          }}
        >
          {step === 1 && (
            <SellerStep1
              data={step1Data}
              onChange={setStep1Data}
              onNext={goNext}
            />
          )}
          {step === 2 && (
            <SellerStep2
              data={step2Data}
              onChange={setStep2Data}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 3 && (
            <SellerStep3
              step1={step1Data}
              step2={step2Data}
              onBack={goBack}
              onGoToStep={goToStep}
            />
          )}
        </div>

        {/* Autosave hint */}
        <p className="mt-5 text-center text-[11px] font-[Inter] text-[#464555]/40 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">cloud_done</span>
          Draft saved automatically
        </p>
      </div>

      {/* Slide keyframes injected globally */}
      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}