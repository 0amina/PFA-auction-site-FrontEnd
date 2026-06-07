// src/lib/createAuction.ts
// Maps the editorial CreateAuction form onto the auction-service contract and
// submits it as multipart/form-data (so images upload in the same request).
//
//   • start date in the future  → POST /auctions/draft   (status 'scheduled')
//   • start now / in the past   → POST /auctions/realtime (status 'active')
//
// For a realtime SOL auction the service returns an unsigned create_auction
// transaction; the seller signs it with Phantom and we relay it on-chain.

import { API_URL, getToken, normalizeAuction, type BackendAuction, type UiAuction } from './api';
import { signTransactionBase64 } from './solana';
import type { FormState } from '../pages/CreateAuctionPage/useFormState';

// Editorial categories → auction-service enum (AUCTION_CATEGORIES).
const CATEGORY_MAP: Record<string, string> = {
  'Timepieces': 'collectibles',
  'Fine Art': 'art',
  'Jewelry': 'jewelry',
  'Automobiles': 'vehicles',
  'Rare Coins': 'collectibles',
};

// Condition grades → service enum.
const CONDITION_MAP: Record<string, 'new' | 'like_new' | 'used' | 'damaged'> = {
  'Mint (As New)': 'new',
  'Excellent': 'like_new',
  'Good (Shows Wear)': 'used',
  'Restored': 'used',
  'Fair (Functional)': 'damaged',
};

const DURATION_DAYS: Record<string, number> = {
  '3 Days': 3,
  '5 Days': 5,
  '7 Days': 7,
  '14 Days': 14,
  'Private Sale (No Timer)': 30,
};

async function postMultipart(path: string, form: FormData): Promise<any> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form, // browser sets the multipart boundary
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const msg = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(msg ?? `Failed to create auction (${res.status})`);
  }
  return body;
}

export async function createAuction(form: FormState, files: File[]): Promise<UiAuction> {
  const days = DURATION_DAYS[form.duration] ?? 7;
  const now = Date.now();
  const start = form.startDate ? new Date(form.startDate) : new Date();
  const isFuture = start.getTime() > now + 60_000; // >1 min ahead → scheduled draft

  const baseStart = isFuture ? start.getTime() : now;
  const end = new Date(baseStart + days * 24 * 60 * 60 * 1000);

  const fd = new FormData();
  fd.append('title', form.title);
  if (form.description) fd.append('description', form.description);
  const category = CATEGORY_MAP[form.category];
  if (category) fd.append('category', category);
  fd.append('startingPrice', String(Number(form.startingBid)));
  if (form.reservePrice !== '' && form.reservePrice != null) {
    fd.append('reservePrice', String(Number(form.reservePrice)));
  }
  fd.append('bidMethod', form.bidMethod);
  const condition = CONDITION_MAP[form.conditionGrade];
  if (condition) fd.append('condition', condition);
  fd.append('endTime', end.toISOString());
  if (isFuture) fd.append('startTime', start.toISOString());
  files.forEach((f) => fd.append('images', f));

  const path = isFuture ? '/auctions/draft' : '/auctions/realtime';
  const result = await postMultipart(path, fd);

  // realtime → { auction, blockchainTransaction?, escrowAddress? }
  // draft    → Auction (mapAuction shape)
  const rawAuction: BackendAuction = result.auction ?? result;

  // Realtime SOL auctions return an on-chain create tx the seller must sign.
  if (result.blockchainTransaction) {
    const signed = await signTransactionBase64(result.blockchainTransaction);
    const token = getToken();
    await fetch(`${API_URL}/blockchain/sendTransaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ signedTransaction: signed }),
    });
  }

  return normalizeAuction(rawAuction);
}
