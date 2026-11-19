import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Reads configuration from e2e/.env (real environment variables win),
 * so no URLs or credentials are hard-coded in tests.
 */
const ENV_FILE = path.resolve(__dirname, '.env');
if (existsSync(ENV_FILE)) {
  process.loadEnvFile(ENV_FILE);
}

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing environment variable ${name}. Copy e2e/.env.example to e2e/.env.`);
  }
  return value;
}

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export const env = {
  uiBaseUrl: required('UI_BASE_URL'),
  apiBaseUrl: required('API_BASE_URL'),
  admin: { email: required('ADMIN_EMAIL'), password: required('ADMIN_PASSWORD') } satisfies Credentials,
  claimant: { email: required('CLAIMANT_EMAIL'), password: required('CLAIMANT_PASSWORD') } satisfies Credentials,
} as const;
