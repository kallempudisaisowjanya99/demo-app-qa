import type { CreateClaimRequest } from '../commons/api-types';
import { isoDateFromToday } from '../utils/date.utils';

/** Default values of a valid claim. Tests override single fields to make it invalid. */
export const VALID_CLAIM = {
  daysAgo: 30,
  incidentLocation: '123 Main St, Springfield',
  claimAmount: 1234.5,
} as const;

/** Values typed into the "Submit New Claim" form in the browser tests. */
export const UI_CLAIM_FORM = {
  daysAgo: 10,
  incidentLocation: '42 Harbour Road, Kochi',
  claimAmount: '1234.50',
  smallAmount: '100',
} as const;

/** One id per run, put in every description so test data is easy to spot. */
const RUN_ID = Date.now().toString(36);
let counter = 0;

/** Unique, readable description such as `API-03-mi3k2x-1 pipe burst in basement`. */
export function uniqueDescription(testId: string): string {
  counter += 1;
  return `${testId}-${RUN_ID}-${counter} pipe burst in basement`;
}

/** A valid claim; override any field to make it invalid. */
export function buildClaim(testId: string, overrides: Partial<CreateClaimRequest> = {}): CreateClaimRequest {
  return {
    incidentDate: isoDateFromToday(-VALID_CLAIM.daysAgo),
    incidentLocation: VALID_CLAIM.incidentLocation,
    description: uniqueDescription(testId),
    claimAmount: VALID_CLAIM.claimAmount,
    ...overrides,
  };
}
