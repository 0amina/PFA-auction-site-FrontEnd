import AuctionCard from '../../components/AuctionCard';
import { MOCK_AUCTIONS } from '../../data/mockAuctions';
import { Link } from 'react-router-dom';

export default function FeaturedSection() {
  const [featured, ...rest] = MOCK_AUCTIONS;

  return (
    <>
      <section className="mt-16"></section>

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight">
            Featured Lots
          </h2>
          <p className="text-on-surface-variant font-label text-sm mt-1">
            Exclusively curated masterpieces with active bidding
          </p>
        </div>

        <Link
          to="/auctions"
          className="text-primary font-semibold text-sm border-b-2 border-primary/30 hover:border-primary transition pb-1"
        >
          View all featured
        </Link>
      </div>

      {/* GRID (IMPORTANT: KEEP 12 GRID) */}
      <div className="grid grid-cols-12 gap-8">
        <AuctionCard auction={featured} variant="featured" />

        {rest.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} variant="standard" />
        ))}
      </div>
    </>
  );
}