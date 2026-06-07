// src/lib/bids.ts
// Bidding flows against the gateway. The gateway binds bidderId to the JWT, so
// the client only ever sends { auctionId, amount }.
//
//   • TND  → POST /bids settles synchronously and returns the recorded Bid.
//   • SOL  → POST /bids returns an unsigned tx (requiresSignature). The buyer
//            signs it with Phantom, then we relay it via POST /bids/confirm.

import { request } from './api';
import { signTransactionBase64 } from './solana';

export interface BidRecord {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  createdAt?: string;
  created_at?: string;
}

interface PreparedSolBid {
  requiresSignature: true;
  bidMethod: 'SOL';
  auctionId: string;
  bidderId: string;
  amount: number;
  transaction: string;
  escrowAddress: string;
  message: string;
}

type PlaceBidResponse = BidRecord | PreparedSolBid;

function isPreparedSolBid(r: PlaceBidResponse): r is PreparedSolBid {
  return (r as PreparedSolBid).requiresSignature === true;
}

/** Public bid history for an auction (most recent first). */
export async function fetchBids(auctionId: string): Promise<BidRecord[]> {
  return request<BidRecord[]>(`/bids/auction/${auctionId}`, { auth: false });
}

/**
 * Places a bid. Handles both currencies transparently:
 * for SOL it triggers the Phantom signature + confirm round-trip.
 * Throws an ApiError (or Phantom error) with a user-readable message on failure.
 */
export async function placeBid(auctionId: string, amount: number): Promise<BidRecord> {
  const res = await request<PlaceBidResponse>('/bids', {
    method: 'POST',
    body: { auctionId, amount },
  });

  if (!isPreparedSolBid(res)) {
    return res; // TND — done.
  }

  // SOL — sign the prepared transaction with Phantom, then relay it.
  const signedTransaction = await signTransactionBase64(res.transaction);

  return request<BidRecord>('/bids/confirm', {
    method: 'POST',
    body: { auctionId, amount, signedTransaction },
  });
}
