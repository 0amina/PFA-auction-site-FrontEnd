// src/pages/seller-dashboard/mockData.ts
// Replace with real API calls when the Listing/Bidding services are ready.

import type { StatCard, Listing, BidEntry, PendingItem, EarningsSegment } from './types';

export const STATS: StatCard[] = [
  { label: 'Total Revenue',   value: '$142,500', trend: '+12.4%', up: true  },
  { label: 'Active Listings', value: '12',       trend: '+3',     up: true  },
  { label: 'Bids Received',   value: '84',       trend: '-5.1%',  up: false },
  { label: 'Completed Sales', value: '45',       trend: '+8.2%',  up: true  },
];

export const LISTINGS: Listing[] = [
  { id: '1', title: '19th Century French Armoire',   currentBid: '$12,450', bids: 18, timeLeft: '02h 14m', timeStatus: 'critical' },
  { id: '2', title: 'Abstract Expressionist Canvas', currentBid: '$4,820',  bids: 12, timeLeft: '18h 45m', timeStatus: 'warning'  },
  { id: '3', title: 'Vintage 1950s Chronograph',     currentBid: '$32,100', bids: 24, timeLeft: '2d 04h',  timeStatus: 'safe'     },
];

export const BID_FEED: BidEntry[] = [
  { name: 'Julian Vane',   initials: 'JV', item: 'French Armoire',        amount: '+$12,450', time: '2m ago'  },
  { name: 'Elena Ross',    initials: 'ER', item: 'Abstract Expressionist', amount: '+$4,820',  time: '14m ago' },
  { name: 'Marcus Thorne', initials: 'MT', item: 'Vintage Chronograph',    amount: '+$32,100', time: '42m ago' },
];

export const PENDING: PendingItem[] = [
  { title: "Marble Sculpture 'Silence'", sub: 'Awaiting Curatorial Approval', chip: 'Draft',  chipColor: 'amber'   },
  { title: 'Art Deco Table Lamp',         sub: 'Authenticity Verification',    chip: 'Review', chipColor: 'primary' },
];

export const EARNINGS_SEGMENTS: EarningsSegment[] = [
  { dot: '#3525cd', label: 'Art & Antiques',    pct: '75%' },
  { dot: '#4edea3', label: 'Luxury Watches',    pct: '15%' },
  { dot: '#e0e3e5', label: 'Other Collections', pct: '10%' },
];