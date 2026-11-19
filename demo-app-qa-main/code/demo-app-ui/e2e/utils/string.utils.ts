/** A string of exactly `length` characters, for boundary checks. */
export function textOfLength(length: number): string {
  return 'x'.repeat(length);
}

/** First 8 characters of a claim id: what the claim tables display. */
export function shortId(claimId: string): string {
  return claimId.substring(0, 8);
}
