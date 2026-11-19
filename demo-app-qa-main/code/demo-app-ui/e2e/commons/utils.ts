/** A date as `yyyy-mm-dd`, `days` away from today (negative = past). */
export function isoDateFromToday(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** A string of exactly `length` characters, for boundary checks. */
export function textOfLength(length: number): string {
  return 'x'.repeat(length);
}

/** First 8 characters of a claim id: what the claim tables display. */
export function shortId(claimId: string): string {
  return claimId.substring(0, 8);
}

/** Money as the UI shows it, e.g. `$1,234.50`. */
export function formatUiCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
