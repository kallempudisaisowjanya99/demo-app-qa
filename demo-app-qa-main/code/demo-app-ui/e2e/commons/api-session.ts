import { expect, request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { ApiRoute, CSRF_COOKIE, CSRF_HEADER, HttpStatus } from './constants';
import { env, type Credentials } from '../env';
import { jitteredIntervals } from '../utils/retry.utils';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

export interface SendOptions {
  readonly data?: unknown;
  readonly query?: Record<string, string>;
  /** Attach the CSRF header from the XSRF-TOKEN cookie. Defaults to true. */
  readonly withCsrf?: boolean;
}

/** Base waits between refused login attempts, used by `toPass` (jitter is added). */
const LOGIN_RETRY_INTERVALS_MS = [300, 700, 1_500, 3_000];
const LOGIN_TIMEOUT_MS = 30_000;

/**
 * One conversation with the BFF, signed in or anonymous.
 * Holds the auth cookies and the CSRF token, exactly like the browser does.
 */
export class ApiSession {
  private constructor(private readonly context: APIRequestContext) {}

  static async anonymous(): Promise<ApiSession> {
    const session = new ApiSession(await request.newContext({ baseURL: env.apiBaseUrl }));
    await session.fetchCsrfToken();
    return session;
  }

  /**
   * Logs in through the real login endpoint.
   * The BFF sometimes answers 401 to valid credentials when several logins arrive
   * at once (DEF-05), so a refused login is retried by Playwright's `toPass` with
   * growing, jittered intervals; there is no fixed sleep.
   */
  static async loginAs(credentials: Credentials): Promise<ApiSession> {
    let signedIn: ApiSession | undefined;
    await expect(async () => {
      const session = await ApiSession.anonymous();
      const response = await session.send('POST', ApiRoute.login, { data: credentials, withCsrf: false });
      if (response.status() !== HttpStatus.Ok) {
        await session.dispose();
      }
      expect(response.status(), `login as ${credentials.email}`).toBe(HttpStatus.Ok);
      await session.fetchCsrfToken();
      signedIn = session;
    }).toPass({ intervals: jitteredIntervals(LOGIN_RETRY_INTERVALS_MS), timeout: LOGIN_TIMEOUT_MS });
    if (signedIn === undefined) {
      throw new Error(`Login failed for ${credentials.email}`);
    }
    return signedIn;
  }

  async send(method: HttpMethod, path: string, options: SendOptions = {}): Promise<APIResponse> {
    const headers: Record<string, string> = {};
    if (options.withCsrf ?? true) {
      const token = await this.cookieValue(CSRF_COOKIE);
      if (token !== undefined) {
        headers[CSRF_HEADER] = token;
      }
    }
    const requestOptions: Parameters<APIRequestContext['fetch']>[1] = { method, headers };
    if (options.query !== undefined) {
      requestOptions.params = options.query;
    }
    if (options.data !== undefined) {
      requestOptions.data = options.data;
    }
    return this.context.fetch(path, requestOptions);
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }

  private async fetchCsrfToken(): Promise<void> {
    // The XSRF cookie is set on every response, even a 401, so the status does not matter.
    await this.context.get(ApiRoute.csrf);
  }

  private async cookieValue(name: string): Promise<string | undefined> {
    const state = await this.context.storageState();
    return state.cookies.find((cookie) => cookie.name === name)?.value;
  }
}
