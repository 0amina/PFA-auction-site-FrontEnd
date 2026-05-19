// src/pages/become-seller/SellerStep2.tsx

import { useState } from 'react';

export interface Step2Data {
  categories: string[];
  experience: number; // 0-3 index
  monthlyListings: string;
  bio: string;
}

interface Props {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORIES = [
  { id: 'art',          icon: 'palette',      label: 'Art' },
  { id: 'jewelry',      icon: 'diamond',      label: 'Jewelry' },
  { id: 'watches',      icon: 'watch',        label: 'Watches' },
  { id: 'collectibles', icon: 'auto_awesome', label: 'Collectibles' },
  { id: 'antiques',     icon: 'museum',       label: 'Antiques' },
  { id: 'electronics',  icon: 'devices',      label: 'Electronics' },
  { id: 'fashion',      icon: 'styler',       label: 'Fashion' },
  { id: 'other',        icon: 'more_horiz',   label: 'Other' },
];

const EXPERIENCE_LABELS = ['0–1 Year', '1–3 Years', '3–5 Years', '5+ Years'];
const LISTING_OPTIONS   = ['1–5', '6–20', '21–50', '50+'];

const labelBase =
  'block font-[Inter] text-[10px] font-bold uppercase tracking-widest text-[#464555] mb-4';

export default function SellerStep2({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<{ categories?: string; bio?: string }>({});

  const toggleCategory = (id: string) => {
    const next = data.categories.includes(id)
      ? data.categories.filter((c) => c !== id)
      : [...data.categories, id];
    onChange({ ...data, categories: next });
    if (errors.categories) setErrors((e) => ({ ...e, categories: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (data.categories.length === 0) e.categories = 'Select at least one category.';
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
          Expertise &amp; Listings
        </h1>
        <p className="text-[#464555] font-[Manrope] leading-relaxed">
          Help us understand your specialization to tailor the best auction experience.
        </p>
      </header>

      <div className="space-y-10">
        {/* Category Grid */}
        <section>
          <label className={labelBase}>Primary Category <span className="text-[#960014] normal-case tracking-normal font-normal">(select all that apply)</span></label>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map(({ id, icon, label }) => {
              const active = data.categories.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCategory(id)}
                  className={[
                    'flex flex-col items-center p-4 rounded-xl border transition-all duration-200',
                    active
                      ? 'border-[#3525cd] bg-white shadow-md ring-1 ring-[#3525cd]/20'
                      : 'border-transparent bg-[#f2f4f6] hover:bg-white hover:shadow-sm',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'material-symbols-outlined text-2xl mb-2 transition-colors',
                      active ? 'text-[#3525cd]' : 'text-[#464555]',
                    ].join(' ')}
                  >
                    {icon}
                  </span>
                  <span
                    className={[
                      'font-[Inter] text-[11px] transition-colors',
                      active ? 'font-bold text-[#3525cd]' : 'font-medium text-[#191c1e]',
                    ].join(' ')}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.categories && (
            <p className="mt-2 flex items-center gap-1 text-[11px] font-[Inter] text-[#960014]">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {errors.categories}
            </p>
          )}
        </section>

        {/* Experience Slider */}
        <section>
          <label className={labelBase} htmlFor="experience-slider">
            Years of Experience
            <span className="ml-2 normal-case tracking-normal font-semibold text-[#3525cd]">
              {EXPERIENCE_LABELS[data.experience]}
            </span>
          </label>
          <div className="px-1">
            <input
              id="experience-slider"
              type="range"
              min={0}
              max={3}
              step={1}
              value={data.experience}
              onChange={(e) => onChange({ ...data, experience: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#e6e8ea] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:bg-[#3525cd]
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:border-[3px]
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between mt-3">
              {EXPERIENCE_LABELS.map((lbl) => (
                <span key={lbl} className="font-[Inter] text-[9px] font-bold text-[#464555]/50 uppercase tracking-tight">
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Monthly Listings */}
        <section>
          <label className={labelBase}>Expected Monthly Listings</label>
          <div className="h-12 bg-[#f2f4f6] rounded-full p-1 flex gap-1">
            {LISTING_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ...data, monthlyListings: opt })}
                className={[
                  'flex-1 rounded-full text-xs font-bold font-[Inter] transition-all duration-200',
                  data.monthlyListings === opt
                    ? 'bg-white text-[#3525cd] shadow-sm'
                    : 'text-[#464555] hover:text-[#191c1e]',
                ].join(' ')}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        {/* Bio */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <label className={`${labelBase} mb-0`} htmlFor="seller-bio">Seller Statement</label>
            <span
              className={[
                'font-[Inter] text-xs transition-colors',
                data.bio.length >= 280 ? 'text-[#960014] font-bold' : 'text-[#464555]/50',
              ].join(' ')}
            >
              {data.bio.length}/300
            </span>
          </div>
          <textarea
            id="seller-bio"
            maxLength={300}
            rows={4}
            placeholder="Describe your inventory source and expertise — tell buyers what makes your items special."
            value={data.bio}
            onChange={(e) => onChange({ ...data, bio: e.target.value })}
            className="w-full bg-[#f2f4f6] focus:bg-white border-none rounded-xl px-5 py-4
              focus:ring-2 focus:ring-[#3525cd]/20 outline-none resize-none
              font-[Manrope] text-[#191c1e] placeholder:text-[#777587] transition-all duration-200"
          />
        </section>

        {/* Navigation */}
        <footer className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 rounded-xl border border-[#c7c4d8]/50 text-[#464555]
              font-[Plus_Jakarta_Sans] font-bold text-sm hover:bg-[#f2f4f6] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="px-10 py-3 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#4f46e5]
              text-white font-[Plus_Jakarta_Sans] font-bold text-sm shadow-lg
              hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            Continue
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </footer>
      </div>
    </div>
  );
}