// src/pages/HomePage/index.tsx
// Sidebar is now a self-contained drawer — no lg:ml-64 offset needed.

import HeroBanner      from './HeroBanner';
import FeaturedSection from './FeaturedSection';

export default function HomePage() {
  return (
    <main className="flex-1 p-8">
      <HeroBanner />
      <FeaturedSection />
      {/* <ConsignCTA /> */}
    </main>
  );
}