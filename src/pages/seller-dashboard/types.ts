// src/pages/seller-dashboard/types.ts

export type TimeStatus = 'critical' | 'warning' | 'safe';

export interface Listing {
  id: string;
  title: string;
  currentBid: string;
  bids: number;
  timeLeft: string;
  timeStatus: TimeStatus;
}

export interface BidEntry {
  name: string;
  initials: string;
  item: string;
  amount: string;
  time: string;
}

export interface PendingItem {
  title: string;
  sub: string;
  chip: string;
  chipColor: 'amber' | 'primary';
}

export interface EarningsSegment {
  dot: string;
  label: string;
  pct: string;
}

export interface StatCard {
  label: string;
  value: string;
  trend: string;
  up: boolean;
}