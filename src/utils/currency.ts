// src/utils/currency.ts
// Single source of truth for the two bidding currencies the marketplace supports:
//   • TND — Tunisian Dinar, settled off-chain via the Konnect gateway
//   • SOL — Solana, settled on-chain via the Anchor escrow program
//
// Use formatMoney() everywhere a monetary amount is rendered so the whole app
// stays consistent. Mirrors the convention already used in the admin tables,
// My Bids and My Listings (fr-TN for dinars, ◎ glyph for SOL).

export type Currency = 'TND' | 'SOL';

/** Format an amount with its currency suffix, e.g. "1 200 TND" or "◎ 12.5 SOL". */
export function formatMoney(amount: number, currency: Currency): string {
  if (currency === 'SOL') {
    return `◎ ${amount.toLocaleString('en-US', { maximumFractionDigits: 3 })} SOL`;
  }
  return `${amount.toLocaleString('fr-TN', { maximumFractionDigits: 0 })} TND`;
}

/** Format a low–high estimate range, e.g. "800 — 1 200 TND". */
export function formatRange(low: number, high: number, currency: Currency): string {
  return `${formatMoney(low, currency)} — ${formatMoney(high, currency)}`;
}

/** Short adornment label for input prefixes / pills ("TND" or the ◎ glyph). */
export function currencySymbol(currency: Currency): string {
  return currency === 'SOL' ? '◎' : 'TND';
}

/** Sensible numeric step for a bid <input> — dinars are whole, SOL is fractional. */
export function bidStep(currency: Currency): number {
  return currency === 'SOL' ? 0.01 : 1;
}
