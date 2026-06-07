// src/pages/HomePage/AtmosphericSection.tsx
// Full-bleed cinematic mid-page section.

const BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAmIezfwtDqzSoUybHQhC743LLS_KTWKRxrQD7ub7YlJQUYIco4Aa9nfMTElx8_iKl6WOMjN7H63ZZQo0Q7UmgFHHVtm1kwmLsIu0On9F_9mmeuv4KXqgEaacnjVbbYvwxO1i77ltG-stU9IzUb0pDjCHjWtXdENsBFrIlk0xZZN2-6mCqcYeeQjoJ-HC7OrnoSTO1XD7_1eFQANA0qHI7AtKAA2YUW7p4JvjqFrxtOD9JpkFTESNPkmJTdzLoMIKpuB9p8aEdxPNXe';

export default function AtmosphericSection() {
  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden" style={{ height: '75vh' }}>
      <div className="absolute inset-0">
        <img src={BG} alt="Sculpture garden at dusk" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(11,28,48,0.45)' }} />
      </div>
      <div className="relative z-10 text-center max-w-4xl px-8">
        <h2
          className="font-headline font-bold text-white mb-8"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          Curated for the Discerning.
        </h2>
        <p className="font-body text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Our experts travel the globe to source pieces that define eras and challenge boundaries.
          Join a community where art meets investment.
        </p>
        <button className="px-12 py-5 bg-white text-on-surface rounded-full font-bold font-label transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 active:scale-95">
          Explore the Archives
        </button>
      </div>
    </section>
  );
}
