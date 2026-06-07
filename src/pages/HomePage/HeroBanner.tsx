// src/pages/HomePage/HeroBanner.tsx
import { useEffect, useRef } from 'react';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC7xKb2dDRQuYC4FBnfjjantuOuG4xEUaPpzxmm8xrqlAB3TmUi8PeMQRbJ4y8MMEu-G3VqCSxMhxlyb-sQaQiYbBOV-J1A8yq2fBeN1PvrJgjbpCcFDuVT2gWfwzW1kGpzBNrmb5P1iCf2l_69uyLweOStbUijLQKp9uRiQqY15802jk5p1JfRJKFZr3cvZnCJ9UASeLwpQ-E1mja05UH2j7DgBxHdq7kDc5eM_BQVK-jMcKyEdiVrnrgjvNcXTEalZwj4I7xlnrQf';

export default function HeroBanner() {
  const imgRef     = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Subtle mouse parallax
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!imgRef.current) return;
      const x = (e.clientX - window.innerWidth  / 2) / 60;
      const y = (e.clientY - window.innerHeight / 2) / 60;
      imgRef.current.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Entry animation
  useEffect(() => {
    const t = setTimeout(() => {
      contentRef.current?.classList.remove('translate-y-6', 'opacity-0');
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden flex items-center"
      style={{ height: '100vh' }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          ref={imgRef}
          src={HERO_IMAGE}
          alt="Grand modern art gallery"
          className="w-full h-full object-cover scale-105"
          style={{ transition: 'transform 0.12s ease-out' }}
        />
        {/* light vignette — keeps background visible like home2 */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Glass panel — left-aligned, constrained width like home2 */}
      <div className="relative z-10 w-full px-8 md:px-12 lg:px-20">
        <div
          ref={contentRef}
          className="translate-y-6 opacity-0 transition-all duration-700 ease-out"
          style={{
            maxWidth:             '480px',       // narrower panel = more bg visible
            background:           'rgba(255,255,255,0.52)',
            backdropFilter:       'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius:         '1.25rem',
            border:               '1px solid rgba(255,255,255,0.3)',
            padding:              '2.25rem 2rem', // comfortable but not oversized
            boxShadow:            '0 8px 32px rgba(30,27,75,0.08)',
          }}
        >
          {/* Eyebrow */}
          <span className="block text-[11px] font-bold tracking-[0.22em] uppercase text-primary mb-3">
            Summer Invitational 2026
          </span>

          {/* Headline — matches home2 sizing */}
          <h1
            className="font-headline font-extrabold text-on-surface leading-[1.15] mb-4"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}
          >
            Own a piece of<br />modern history.
          </h1>

          {/* Body */}
          <p className="text-on-surface-variant text-[15px] leading-relaxed mb-7 max-w-sm">
            Discover curated collections from emerging global artists and
            legendary archives. Secure your legacy today in our most
            exclusive seasonal event.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-3 flex-wrap">
            <button className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm transition-all hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 active:scale-95">
              Start Bidding
            </button>
            <button
              className="px-6 py-2.5 rounded-full font-bold text-sm text-on-surface transition-all hover:bg-white/40 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.25)',
                border:     '1px solid rgba(0,0,0,0.1)',
              }}
            >
              View Catalogue
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <span className="material-symbols-outlined text-white/60" style={{ fontSize: '2rem' }}>
          keyboard_double_arrow_down
        </span>
      </div>
    </section>
  );
}
