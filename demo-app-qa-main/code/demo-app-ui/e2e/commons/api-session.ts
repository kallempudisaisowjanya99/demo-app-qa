import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { ApiRoute, CSRF_COOKIE, CSRF_HEADER, HttpStatus } from './constants';
import { env, type Credentials } from '../env';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

export interface SendOptions {
  readonly data?: unknown;
  readonly query?: Record<string, string>;
  /** Attach the CSRF header from the XSRF-TOKEN cookie. Defaults to true. */
  readonly withCsrf?: boolean;
}

const LOGIN_ATTEMPTS = 6;

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
   * at once, so a refused login is retried with a short random pause.
   */
  static async loginAs(credentials: Credentials): Promise<ApiSession> {
    let lastStatus = 0;
    for (let attempt = 1; attempt <= LOGIN_ATTEMPTS; attempt++) {
      const session = await ApiSession.anonymous();
      const response = await session.send('POST', ApiRoute.login, { data: credentials, withCsrf: false });
      lastStatus = response.status();
      if (lastStatus === HttpStatus.Ok) {
        await session.fetchCsrfToken();
        return session;
      }
      await session.dispose();
      await new Promise((resolve) => setTimeout(resolve, attempt * 300 + Math.random() * 700));
    }
    throw new Error(`Login failed for ${credentials.email} after ${LOGIN_ATTEMPTS} attempts: HTTP ${lastStatus}`);
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
