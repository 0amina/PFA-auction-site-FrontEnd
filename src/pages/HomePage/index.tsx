// src/pages/HomePage/index.tsx

import HeroBanner        from './HeroBanner';
import FeaturedSection   from './FeaturedSection';
import AtmosphericSection from './AtmosphericSection';
import CollectionsGrid   from './CollectionsGrid';

export default function HomePage() {
  return (
    <main className="flex-1">
  <HeroBanner />

  <div className="max-w-7xl mx-auto px-6 lg:px-10">
    <FeaturedSection />
    <AtmosphericSection />
    <CollectionsGrid />
  </div>
</main>
  );
}
