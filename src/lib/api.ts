// src/lib/api.ts
// Single source of truth for talking to the backend.
//
// The backend is a set of NestJS microservices that all sit behind ONE API
// Gateway (default http://localhost:3000). The browser only ever talks to the
// gateway — it forwards the Authorization header downstream and handles CORS.
// Configure the base URL with VITE_API_URL (see .env / .env.example).

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

const TOKEN_KEY = 'curator_token';

/** Reads the persisted JWT (set by AuthContext on login). */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Error thrown by `request()` carrying the HTTP status and parsed body. */
export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Plain object → JSON. Pass a FormData/Blob to send it as-is (no JSON header). */
  body?: unknown;
  /** Attach the bearer token (default: true). */
  auth?: boolean;
}

/**
 * Fetch wrapper that hits the gateway, attaches the JWT, serialises JSON,
 * and throws an {@link ApiError} on non-2xx responses.
 *
 * Returns the parsed JSON body (or `undefined` for 204/empty responses).
 */
export async function request<T = unknown>(
  path: string,
  { body, auth = true, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(isForm ? {} : body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...((headers as Record<string, string>) ?? {}),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: finalHeaders,
    body: isForm ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const parsed = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const message = extractMessage(parsed) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, parsed);
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** NestJS errors come back as { message: string | string[] }. */
function extractMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const m = (body as { message?: unknown }).message;
  if (Array.isArray(m)) return m.join(', ');
  if (typeof m === 'string') return m;
  return null;
}

// ─── Auction normalisation ─────────────────────────────────────────────────
//
// The auction-service returns snake/camel-mixed rows (see mapAuction). The UI
// components were built around a friendlier shape, so we normalise once here.

export type BidMethod = 'TND' | 'SOL';
export type UiAuctionStatus = 'active' | 'ending_soon' | 'closed' | 'upcoming';

/** Raw auction as returned by the backend (auction-service mapAuction). */
export interface BackendAuction {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  condition?: string | null;
  starting_price: number | string;
  current_price: number | string;
  reserve_price?: number | string | null;
  seller_id: string;
  highest_bidder_id?: string | null;
  winner_id?: string | null;
  bid_count?: number | string;
  view_count?: number | string;
  startTime?: string;
  endTime?: string;
  status: string;
  image_urls?: string[];
  bidmethod?: BidMethod | null;
  escrow_address?: string | null;
  sellerwallet?: string | null;
  solana_auction_id?: string | null;
}

/** Friendly, render-ready auction used across the marketplace UI. */
export interface UiAuction {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  imageUrls: string[];
  currentBid: number;
  startingBid: number;
  reservePrice: number | null;
  bidCount: number;
  bidderCount: number;
  viewCount: number;
  status: UiAuctionStatus;
  rawStatus: string;
  endsAt: Date;
  endTime: string;
  hasReserve: boolean;
  isHotLot: boolean;
  sellerId: string;
  highestBidderId: string | null;
  winnerId: string | null;
  bidMethod: BidMethod;
  sellerWallet: string | null;
  escrowAddress: string | null;
  solanaAuctionId: string | null;
  condition: string | null;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=1200&auto=format&fit=crop';

function toUiStatus(raw: string, endsAt: Date): UiAuctionStatus {
  switch (raw) {
    case 'active': {
      const msLeft = endsAt.getTime() - Date.now();
      return msLeft > 0 && msLeft < 60 * 60 * 1000 ? 'ending_soon' : 'active';
    }
    case 'scheduled':
    case 'draft':
      return 'upcoming';
    case 'ended':
    case 'awaiting':
    case 'confirmed':
      return 'closed';
    default:
      return 'active';
  }
}

export function normalizeAuction(raw: BackendAuction): UiAuction {
  const endTime = raw.endTime ?? new Date().toISOString();
  const endsAt = new Date(endTime);
  const images = raw.image_urls ?? [];
  const reserve = raw.reserve_price != null ? Number(raw.reserve_price) : null;

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? '',
    category: raw.category ?? 'Uncategorized',
    subCategory: raw.condition ?? '',
    imageUrl: images[0] ?? PLACEHOLDER_IMAGE,
    imageUrls: images,
    currentBid: Number(raw.current_price ?? 0),
    startingBid: Number(raw.starting_price ?? 0),
    reservePrice: reserve,
    bidCount: Number(raw.bid_count ?? 0),
    bidderCount: Number(raw.bid_count ?? 0),
    viewCount: Number(raw.view_count ?? 0),
    status: toUiStatus(raw.status, endsAt),
    rawStatus: raw.status,
    endsAt,
    endTime,
    hasReserve: reserve != null,
    isHotLot: Number(raw.bid_count ?? 0) >= 10,
    sellerId: raw.seller_id,
    highestBidderId: raw.highest_bidder_id ?? null,
    winnerId: raw.winner_id ?? null,
    bidMethod: (raw.bidmethod as BidMethod) ?? 'TND',
    sellerWallet: raw.sellerwallet ?? null,
    escrowAddress: raw.escrow_address ?? null,
    solanaAuctionId: raw.solana_auction_id ?? null,
    condition: raw.condition ?? null,
  };
}
