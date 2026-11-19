import type { ClaimStatus } from './constants';

/** Body sent to create a claim. */
export interface CreateClaimRequest {
  incidentDate: string;
  incidentLocation: string;
  description: string;
  claimAmount: number;
}

/** Full claim, as returned by create, get-by-id and the admin list. */
export interface ClaimResponse extends CreateClaimRequest {
  claimId: string;
  userId: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}

/** Claim summary, as returned by the claimant's own list. */
export interface ClaimSummaryResponse {
  claimId: string;
  description: string;
  status: ClaimStatus;
}
