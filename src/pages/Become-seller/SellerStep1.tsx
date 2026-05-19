// src/pages/become-seller/SellerStep1.tsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export interface Step1Data {
  shopName: string;
  sellerType: 'individual' | 'business';
  businessName: string;
  taxId: string;
  country: string;
  phoneCode: string;
  phone: string;
}

interface Props {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  onNext: () => void;
}

const COUNTRIES = [
  { value: 'tn', label: 'Tunisia' },
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'jp', label: 'Japan' },
];

const PHONE_CODES = [
  { value: '+216', label: '+216 (TN)' },
  { value: '+1',   label: '+1 (US)' },
  { value: '+44',  label: '+44 (GB)' },
  { value: '+33',  label: '+33 (FR)' },
  { value: '+49',  label: '+49 (DE)' },
  { value: '+971', label: '+971 (AE)' },
];

const inputBase =
  'w-full h-14 px-5 bg-[#f2f4f6] focus:bg-white text-[#191c1e] border-none rounded-lg ' +
  'focus:ring-2 focus:ring-[#3525cd]/20 outline-none placeholder:text-[#777587] ' +
  'font-[Manrope] transition-all duration-200';

const labelBase =
  'block font-[Inter] text-[10px] font-bold uppercase tracking-widest text-[#464555] mb-2';

export default function SellerStep1({ data, onChange, onNext }: Props) {
  const { user } = useAuth();
  const [errors, setErrors] = useState<Partial<Record<keyof Step1Data, string>>>({});

  const set = (field: keyof Step1Data, value: string) => {
    onChange({ ...data, [field]: value });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!data.shopName.trim())  e.shopName = 'Display name is required.';
    if (!data.country)           e.country  = 'Please select a country.';
    if (!data.phone.trim())      e.phone    = 'Phone number is required.';
    if (data.sellerType === 'business') {
      if (!data.businessName.trim()) e.businessName = 'Business name is required.';
      if (!data.taxId.trim())        e.taxId        = 'Tax ID / registration number is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-[#191c1e] mb-2">
          Begin your journey.
        </h1>
        <p className="text-[#464555] font-[Manrope] leading-relaxed">
          Tell us about yourself. This helps us verify your account and build trust in the community.
        </p>
      </header>

      <div className="space-y-8">
        {/* Full Legal Name — read-only */}
        <div>
          <label className={labelBase}>Full Legal Name</label>
          <div className="relative">
            <input
              readOnly
              className={`${inputBase} text-[#464555] cursor-not-allowed`}
              value={`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()}
            />
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#c7c4d8] text-[20px]">
              lock
            </span>
          </div>
          <p className="mt-1 text-[11px] font-[Inter] text-[#777587]">
            Verified via your account. Contact support to change.
          </p>
        </div>

        {/* Display Name + Seller Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelBase} htmlFor="shopName">Display Name / Shop Name</label>
            <input
              id="shopName"
              className={inputBase}
              placeholder="e.g. Sterling Fine Arts"
              value={data.shopName}
              onChange={(e) => set('shopName', e.target.value)}
            />
            {errors.shopName && <FieldError msg={errors.shopName} />}
          </div>

          <div>
            <label className={labelBase}>Seller Type</label>
            <div className="h-14 bg-[#f2f4f6] rounded-lg p-1.5 flex gap-1">
              {(['individual', 'business'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('sellerType', type)}
                  className={[
                    'flex-1 rounded-md text-sm font-bold font-[Inter] transition-all duration-200 capitalize',
                    data.sellerType === type
                      ? 'bg-white text-[#3525cd] shadow-sm'
                      : 'text-[#464555] hover:text-[#191c1e]',
                  ].join(' ')}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Business fields — conditional */}
        {data.sellerType === 'business' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.2s_ease]">
            <div>
              <label className={labelBase} htmlFor="businessName">Business Name</label>
              <input
                id="businessName"
                className={inputBase}
                placeholder="e.g. Sterling Fine Arts LLC"
                value={data.businessName}
                onChange={(e) => set('businessName', e.target.value)}
              />
              {errors.businessName && <FieldError msg={errors.businessName} />}
            </div>
            <div>
              <label className={labelBase} htmlFor="taxId">Tax ID / Registration No.</label>
              <input
                id="taxId"
                className={inputBase}
                placeholder="e.g. 1234567890"
                value={data.taxId}
                onChange={(e) => set('taxId', e.target.value)}
              />
              {errors.taxId && <FieldError msg={errors.taxId} />}
            </div>
          </div>
        )}

        {/* Country */}
        <div>
          <label className={labelBase} htmlFor="country">Country of Operation</label>
          <div className="relative">
            <select
              id="country"
              className={`${inputBase} appearance-none`}
              value={data.country}
              onChange={(e) => set('country', e.target.value)}
            >
              <option value="" disabled>Select a country…</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777587]">
              expand_more
            </span>
          </div>
          {errors.country && <FieldError msg={errors.country} />}
        </div>

        {/* Phone */}
        <div>
          <label className={labelBase} htmlFor="phone">Phone Number</label>
          <div className="flex gap-3">
            <div className="relative w-32 shrink-0">
              <select
                className={`${inputBase} appearance-none pr-8 w-full`}
                value={data.phoneCode}
                onChange={(e) => set('phoneCode', e.target.value)}
              >
                {PHONE_CODES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#777587] text-[18px]">
                expand_more
              </span>
            </div>
            <div className="flex-grow">
              <input
                id="phone"
                type="tel"
                className={inputBase}
                placeholder="e.g. 20 123 456"
                value={data.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
              {errors.phone && <FieldError msg={errors.phone} />}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-14 bg-gradient-to-r from-[#3525cd] to-[#4f46e5] text-white font-[Plus_Jakarta_Sans] font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Continue to Expertise
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[11px] font-[Inter] text-[#960014]">
      <span className="material-symbols-outlined text-[14px]">error</span>
      {msg}
    </p>
  );
}