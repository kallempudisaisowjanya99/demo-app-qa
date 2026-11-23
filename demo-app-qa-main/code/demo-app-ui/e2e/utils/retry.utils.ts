/**
 * Retry intervals for `expect(...).toPass({ intervals })` with random jitter added,
 * so parallel workers that were refused together do not retry together again.
 */
export function jitteredIntervals(baseMs: readonly number[], maxJitterMs = 700): number[] {
  return baseMs.map((ms) => ms + Math.round(Math.random() * maxJitterMs));
}
