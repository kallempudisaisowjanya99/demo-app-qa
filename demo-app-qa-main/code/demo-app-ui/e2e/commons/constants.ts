/** Pages of the Next.js UI. */
export const UiRoute = {
  login: '/login',
  claims: '/claims',
  newClaim: '/claims/new',
  adminClaims: '/admin/claims',
} as const;

/** BFF endpoints. */
export const ApiRoute = {
  login: '/api/auth/login',
  csrf: '/api/auth/csrf',
  claims: '/api/claims',
  claimById: (claimId: string) => `/api/claims/${claimId}`,
  adminClaims: '/api/admin/claims',
  adminClaimStatus: (claimId: string) => `/api/admin/claims/${claimId}/status`,
} as const;

export const CSRF_HEADER = 'X-XSRF-TOKEN';
export const CSRF_COOKIE = 'XSRF-TOKEN';

export const HttpStatus = {
  Ok: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
} as const;

export const ClaimStatus = {
  Submitted: 'SUBMITTED',
  UnderReview: 'UNDER_REVIEW',
  Approved: 'APPROVED',
  Rejected: 'REJECTED',
  Closed: 'CLOSED',
} as const;

export type ClaimStatus = (typeof ClaimStatus)[keyof typeof ClaimStatus];

/** Text the UI shows for each status (badge and dropdown option). */
export const STATUS_LABEL: Readonly<Record<ClaimStatus, string>> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CLOSED: 'Closed',
};

/** Shortest legal path from SUBMITTED to each status (rule from ClaimStatus.canTransitionTo). */
export const PATH_FROM_SUBMITTED: Readonly<Record<ClaimStatus, readonly ClaimStatus[]>> = {
  SUBMITTED: [],
  UNDER_REVIEW: ['UNDER_REVIEW'],
  APPROVED: ['UNDER_REVIEW', 'APPROVED'],
  REJECTED: ['REJECTED'],
  CLOSED: ['UNDER_REVIEW', 'APPROVED', 'CLOSED'],
};

/** Field limits enforced by both the UI form and the Claims Service. */
export const ClaimLimits = {
  location: { min: 5, max: 200 },
  description: { min: 10, max: 1000 },
  amount: { max: 1_000_000 },
} as const;
