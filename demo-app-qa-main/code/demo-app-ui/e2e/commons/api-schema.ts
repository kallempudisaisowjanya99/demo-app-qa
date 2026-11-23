import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';
import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { load } from 'js-yaml';

/**
 * Response bodies are validated against the BFF's own OpenAPI contract (bff-api.yml),
 * so the tests fail when the API drifts from its documented shape (missing field,
 * wrong type, unknown status, bad uuid/date format).
 */
const BFF_OPENAPI_FILE = path.resolve(__dirname, '../../../bff-service/src/main/resources/openapi/bff-api.yml');
const SPEC_ID = 'bff-api';

/** Schemas from `components.schemas` in bff-api.yml that the tests check. */
export type SchemaName = 'ClaimResponse' | 'ClaimSummaryResponse' | 'ProblemDetail';

interface OpenApiDocument {
  readonly components: { readonly schemas: Record<string, unknown> };
}

// strict: false because OpenAPI adds keywords (example, description) that are not JSON Schema.
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
// OpenAPI's "double" only narrows "number"; any number is valid.
ajv.addFormat('double', true);

const openApi = load(readFileSync(BFF_OPENAPI_FILE, 'utf8')) as OpenApiDocument;
ajv.addSchema({ $id: SPEC_ID, components: openApi.components });

const validators = new Map<string, ValidateFunction>();

function validatorFor(name: SchemaName, asArray: boolean): ValidateFunction {
  const key = `${name}${asArray ? '[]' : ''}`;
  let validate = validators.get(key);
  if (validate === undefined) {
    const ref = { $ref: `${SPEC_ID}#/components/schemas/${name}` };
    validate = ajv.compile(asArray ? { type: 'array', items: ref } : ref);
    validators.set(key, validate);
  }
  return validate;
}

function check(body: unknown, name: SchemaName, asArray: boolean, soft: boolean): void {
  const validate = validatorFor(name, asArray);
  const valid = validate(body);
  const problems = ajv.errorsText(validate.errors, { separator: '\n', dataVar: 'body' });
  const assert = soft ? expect.soft : expect;
  assert(valid, `response must match ${name}${asArray ? '[]' : ''} in bff-api.yml:\n${problems}`).toBe(true);
}

export interface SchemaCheckOptions {
  /** Record a mismatch but let the test continue (for data-driven loops). */
  readonly soft?: boolean;
}

/** Fails the test unless `body` matches the named schema. */
export function expectSchema(body: unknown, name: SchemaName, options: SchemaCheckOptions = {}): void {
  check(body, name, false, options.soft ?? false);
}

/** Fails the test unless `body` is an array whose items all match the named schema. */
export function expectArraySchema(body: unknown, name: SchemaName): void {
  check(body, name, true, false);
}
