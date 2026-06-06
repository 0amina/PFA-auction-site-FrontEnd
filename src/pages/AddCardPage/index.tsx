// src/pages/AddCardPage/index.tsx
// Interactive card-add page matching the "Secure Payment" HTML reference.
// Features: live card preview sync, tilt parallax, auto-format inputs, submit animation.

import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CardState {
  name:   string;
  number: string;
  expiry: string;
  cvv:    string;
}

type SubmitStatus = 'idle' | 'loading' | 'success';

// ─── Card Preview ─────────────────────────────────────────────────────────────
function CardPreview({
  card,
  tilt,
  flipped,
  previewRef,
}: {
  card: CardState;
  tilt: { x: number; y: number };
  flipped: boolean;
  previewRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Build masked number display
  const raw  = card.number.replace(/\s/g, '');
  const mask = '**** **** **** ****';
  let display = '';
  for (let i = 0; i < 19; i++) {
    if (mask[i] === ' ') { display += ' '; continue; }
    const charIdx = i - Math.floor(i / 5); // account for spaces
    display += raw[charIdx] ?? '*';
  }
  // Simpler: use the formatted value directly, pad with *
  const formatted = card.number || '';
  const padded    = formatted + mask.slice(formatted.length);

  const transform = flipped
    ? `perspective(1000px) rotateY(180deg) scale(1.05)`
    : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`;

  return (
    <div
      ref={previewRef}
      style={{
        transition:  'transform 0.3s ease',
        transform,
        background:  'linear-gradient(135deg, #2D27D1 0%, #1E1A8F 100%)',
        boxShadow:   '0 20px 40px rgba(45,39,209,0.3)',
        borderRadius: '1rem',
        position:    'relative',
        width:       '100%',
        maxWidth:    '440px',
        aspectRatio: '1.586 / 1',
        padding:     '2rem',
        display:     'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow:    'hidden',
      }}
    >
      {/* Mesh overlay */}
      <div
        style={{
          position:        'absolute',
          inset:           0,
          borderRadius:    '1rem',
          backgroundImage: 'radial-gradient(at 0% 0%, rgba(255,255,255,0.15) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(0,0,0,0.1) 0, transparent 50%)',
          pointerEvents:   'none',
        }}
      />
      {/* Shimmer */}
      <div
        style={{
          position:   'absolute',
          inset:      0,
          overflow:   'hidden',
          borderRadius: '1rem',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position:   'absolute',
            top: '-50%', left: '-50%',
            width: '200%', height: '200%',
            background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.08) 50%, transparent 55%)',
            animation:  'shimmer 8s infinite linear',
          }}
        />
      </div>

      {/* Top: brand + chip */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <span className="font-black text-2xl text-white italic tracking-tighter">AURA</span>
          <span className="text-white/60 font-bold uppercase tracking-[0.3em]" style={{ fontSize: '9px' }}>PREMIUM</span>
        </div>
        <div
          style={{
            width: '3rem', height: '2.5rem',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
            borderRadius: '0.375rem',
            border: '1px solid rgba(255,255,255,0.2)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', height: '100%', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>

      {/* Middle: number */}
      <div className="relative z-10">
        <div
          className="text-white font-medium drop-shadow-sm"
          style={{ fontFamily: 'monospace', fontSize: 'clamp(16px,4vw,22px)', letterSpacing: '0.15em' }}
        >
          {padded}
        </div>
      </div>

      {/* Bottom: name + expiry */}
      <div className="relative z-10 flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-white/50 font-bold uppercase tracking-[0.2em] mb-1" style={{ fontSize: '9px' }}>Card Holder</span>
          <div className="font-bold text-xs text-white uppercase tracking-wider">
            {card.name || 'YOUR NAME'}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-white/50 font-bold uppercase tracking-[0.2em] mb-1" style={{ fontSize: '9px' }}>Expires</span>
          <div className="font-bold text-xs text-white tracking-widest">
            {card.expiry || 'MM/YY'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label, id, icon, placeholder, type = 'text',
  maxLength, value, onChange, error, extra,
}: {
  label:       string;
  id:          string;
  icon:        string;
  placeholder: string;
  type?:       string;
  maxLength?:  number;
  value:       string;
  onChange:    (v: string) => void;
  error?:      string;
  extra?:      React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        className="font-bold text-xs text-on-surface uppercase tracking-widest flex justify-between items-center"
      >
        <span className="flex items-center gap-2">{label}{extra}</span>
        {error && <span className="text-error font-bold" style={{ fontSize: '10px' }}>{error}</span>}
      </label>
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-outline focus:border-primary focus:bg-white rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all duration-200 font-medium"
          style={{ boxShadow: 'none' }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AddCardPage() {
  const [card, setCard]         = useState<CardState>({ name: '', number: '', expiry: '', cvv: '' });
  const [tilt, setTilt]         = useState({ x: 0, y: 0 });
  const [cvvFocused, setCvvFocused] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [status, setStatus]     = useState<SubmitStatus>('idle');
  const [errors, setErrors]     = useState<Partial<CardState>>({});
  const previewRef              = useRef<HTMLDivElement>(null);

  // ── Input formatters ──────────────────────────────────────────────────────
  function handleNumberChange(raw: string) {
    const digits    = raw.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    setCard(c => ({ ...c, number: formatted }));
  }

  function handleExpiryChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
    setCard(c => ({ ...c, expiry: formatted }));
  }

  // ── Tilt on mouse move ────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (cvvFocused || !previewRef.current) return;
    const rect  = previewRef.current.getBoundingClientRect();
    const x     = e.clientX - rect.left;
    const y     = e.clientY - rect.top;
    const rotX  =  (y - rect.height / 2) / 25;
    const rotY  = -(x - rect.width  / 2) / 25;
    setTilt({ x: rotX, y: rotY });
  }, [cvvFocused]);

  const onMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Partial<CardState> = {};
    if (!card.name.trim())                           e.name   = 'Required';
    if (card.number.replace(/\s/g, '').length < 16) e.number = 'Invalid Format';
    if (card.expiry.length < 5)                      e.expiry = 'Invalid';
    if (card.cvv.length < 3)                         e.cvv    = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || status !== 'idle') return;
    setStatus('loading');
    setTimeout(() => setStatus('success'), 2000);
  }

  return (
    <>
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translate(-30%, -30%); }
          100% { transform: translate(30%,  30%);  }
        }
      `}</style>

      <main className="py-12 px-6 md:px-12 max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <nav className="mb-12 flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          <span className="font-bold uppercase tracking-[0.2em] text-primary" style={{ fontSize: '11px' }}>
            Add New Card
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* ── Left: Card preview ── */}
          <div className="lg:col-span-5">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-on-surface mb-4 leading-tight">Secure Payment</h1>
              <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
                Add a new credit or debit card to your Aura Executive Suite for instant liquidity.
              </p>
            </div>

            {/* Card */}
            <div onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} style={{ perspective: '1000px' }}>
              <CardPreview
                card={card}
                tilt={tilt}
                flipped={cvvFocused}
                previewRef={previewRef}
              />
            </div>

            {/* Security badges */}
            <div className="mt-16 grid grid-cols-3 gap-4">
              {[
                { icon: 'lock',          label: 'AES-256'   },
                { icon: 'verified_user', label: 'PCI DSS'   },
                { icon: 'shield',        label: '3D Secure' },
              ].map(b => (
                <div
                  key={b.label}
                  className="flex flex-col items-center p-5 bg-white rounded-xl border border-outline shadow-sm"
                >
                  <span className="material-symbols-outlined text-primary mb-3" style={{ fontSize: '22px' }}>
                    {b.icon}
                  </span>
                  <span className="font-bold uppercase tracking-wider text-on-surface-variant" style={{ fontSize: '10px' }}>
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-10 border border-outline shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Name */}
              <Field
                label="Full Name (as it appears on card)"
                id="card-holder"
                icon="person"
                placeholder="e.g. JAMES MORRISON"
                value={card.name}
                onChange={v => setCard(c => ({ ...c, name: v }))}
                error={errors.name}
              />

              {/* Card number */}
              <Field
                label="Card Number"
                id="card-number"
                icon="credit_card"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={card.number}
                onChange={handleNumberChange}
                error={errors.number}
              />

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-8">
                <Field
                  label="Expiration Date"
                  id="expiry"
                  icon="calendar_month"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={card.expiry}
                  onChange={handleExpiryChange}
                  error={errors.expiry}
                />

                {/* CVV with tooltip */}
                <div className="space-y-3">
                  <label
                    htmlFor="cvv"
                    className="font-bold text-xs text-on-surface uppercase tracking-widest flex items-center gap-2"
                  >
                    CVV
                    <div className="relative group/tooltip">
                      <span className="material-symbols-outlined text-on-surface-variant cursor-help" style={{ fontSize: '18px' }}>
                        info
                      </span>
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-on-surface text-white rounded-lg shadow-xl leading-relaxed opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 font-medium"
                        style={{ fontSize: '11px' }}
                      >
                        The 3 or 4 digit security code usually found on the back of your card.
                      </div>
                    </div>
                    {errors.cvv && (
                      <span className="ml-auto text-error font-bold" style={{ fontSize: '10px' }}>{errors.cvv}</span>
                    )}
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">
                      lock_person
                    </span>
                    <input
                      id="cvv"
                      type="password"
                      maxLength={4}
                      placeholder="***"
                      value={card.cvv}
                      onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '') }))}
                      onFocus={() => setCvvFocused(true)}
                      onBlur={() => setCvvFocused(false)}
                      className="w-full bg-gray-50 border border-outline focus:border-primary focus:bg-white rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all duration-200 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Save card checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  id="save-card"
                  type="checkbox"
                  checked={saveCard}
                  onChange={e => setSaveCard(e.target.checked)}
                  className="mt-0.5 w-5 h-5 text-primary border-outline rounded focus:ring-primary/20 transition-all"
                />
                <label htmlFor="save-card" className="text-sm text-on-surface-variant leading-relaxed font-medium">
                  Save this card to my secure vault for future transactions. By clicking 'Add Card',
                  you agree to our{' '}
                  <a href="#" className="text-primary font-bold hover:underline">Terms of Service</a>.
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={status !== 'idle'}
                className="w-full text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 active:scale-[0.98] mt-6 uppercase tracking-widest text-sm"
                style={{
                  background:  status === 'success' ? '#10B981' : '#2D27D1',
                  boxShadow:   '0 4px 14px 0 rgba(45,39,209,0.39)',
                  transition:  'background 0.4s ease',
                }}
              >
                {status === 'idle' && (
                  <>
                    <span>Add Card</span>
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-xl">
                      arrow_forward
                    </span>
                  </>
                )}
                {status === 'loading' && (
                  <>
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ animation: 'spin 1s linear infinite' }}
                    >
                      sync
                    </span>
                    <span>Authorizing...</span>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <span>Card Secured</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-12 pt-10 border-t border-outline flex flex-col md:flex-row justify-between items-center gap-6 text-on-surface-variant font-bold uppercase tracking-widest" style={{ fontSize: '12px' }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>verified</span>
                <span>Encrypted Transaction</span>
              </div>
              <div className="flex gap-8">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Cookie Settings</a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Spin animation for loading button */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
