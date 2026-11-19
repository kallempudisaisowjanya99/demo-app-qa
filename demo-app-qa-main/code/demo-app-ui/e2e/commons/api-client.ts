import { expect, type APIResponse } from '@playwright/test';
import type { ApiSession } from './api-session';
import { ApiRoute, HttpStatus, PATH_FROM_SUBMITTED, type ClaimStatus } from './constants';
import type { ClaimResponse, ClaimSummaryResponse, CreateClaimRequest } from './api-types';
import { buildClaim } from '../testdata/claim.data';

export async function bodyOf<T>(response: APIResponse): Promise<T> {
  return (await response.json()) as T;
}

/** Claim endpoints any signed-in user calls for their own claims. */
export class ClaimsApi {
  constructor(private readonly session: ApiSession) {}

  create(payload: unknown): Promise<APIResponse> {
    return this.session.send('POST', ApiRoute.claims, { data: payload });
  }

  /** Creates a claim and checks it succeeded (for test set-up). */
  async createOk(payload: CreateClaimRequest): Promise<ClaimResponse> {
    const response = await this.create(payload);
    expect(response.status(), 'claim set-up must succeed').toBe(HttpStatus.Created);
    return bodyOf<ClaimResponse>(response);
  }

  list(): Promise<APIResponse> {
    return this.session.send('GET', ApiRoute.claims);
  }

  async listOk(): Promise<ClaimSummaryResponse[]> {
    const response = await this.list();
    expect(response.status(), 'claim list must succeed').toBe(HttpStatus.Ok);
    return bodyOf<ClaimSummaryResponse[]>(response);
  }

  async getOk(claimId: string): Promise<ClaimResponse> {
    const response = await this.session.send('GET', ApiRoute.claimById(claimId));
    expect(response.status(), `claim ${claimId} must be readable`).toBe(HttpStatus.Ok);
    return bodyOf<ClaimResponse>(response);
  }
}

/** Endpoints only an admin may call. */
export class AdminApi {
  constructor(private readonly session: ApiSession) {}

  listClaims(status?: ClaimStatus): Promise<APIResponse> {
    return this.session.send('GET', ApiRoute.adminClaims, status === undefined ? {} : { query: { status } });
  }

  updateStatus(claimId: string, newStatus: ClaimStatus, withCsrf = true): Promise<APIResponse> {
    return this.session.send('PATCH', ApiRoute.adminClaimStatus(claimId), { data: { newStatus }, withCsrf });
  }

  async updateStatusOk(claimId: string, newStatus: ClaimStatus): Promise<void> {
    const response = await this.updateStatus(claimId, newStatus);
    expect(response.status(), `moving ${claimId} to ${newStatus} must succeed`).toBe(HttpStatus.Ok);
  }

  /** Moves a SUBMITTED claim along the legal path to `target`. */
  async moveTo(claimId: string, target: ClaimStatus): Promise<void> {
    for (const step of PATH_FROM_SUBMITTED[target]) {
      await this.updateStatusOk(claimId, step);
    }
  }
}

/**
 * Creates a claim owned by `owner` through the API, so each test owns its data.
 * Signup is not used for a second claimant; claims raised by the admin account
 * act as "someone else's" claims.
 */
export async function seedClaim(owner: ClaimsApi, testId: string): Promise<ClaimResponse> {
  return owner.createOk(buildClaim(testId));
}
