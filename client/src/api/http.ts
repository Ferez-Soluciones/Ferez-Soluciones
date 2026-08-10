/**
 * Client API layer — transport.
 * Responsibility: talk to the Express API, unwrap the response envelope and turn
 * failures into one predictable error type.
 * Must not know about: React, components or anything visual.
 *
 * Every endpoint answers `{ success: true, data }` or
 * `{ success: false, error: { message, code, fields? } }`. Unwrapping it in a
 * single place means components receive plain data and never inspect envelopes.
 */
import type { FieldErrors } from '../lib/validators.js';

/** Base path. Relative on purpose: Vite proxies /api in dev, Express serves it in prod. */
const API_BASE = '/api';

interface SuccessEnvelope<T> {
  success: true;
  data: T;
}

interface ErrorEnvelope {
  success: false;
  error: {
    message: string;
    code: string;
    fields?: FieldErrors;
  };
}

/**
 * An API call that did not succeed — a non-2xx response, a malformed body, or a
 * network failure. Carries the per-field messages when the server rejected a
 * form, so the contact form can highlight the offending inputs.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: FieldErrors | undefined;

  constructor(message: string, status: number, code: string, fields?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

/** Message shown when the request never reached the server at all. */
const NETWORK_ERROR_MESSAGE =
  'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.';

/**
 * Performs a request and returns the unwrapped `data`.
 *
 * @param path - Path relative to /api, e.g. "/services".
 * @param init - Standard fetch options.
 * @throws {ApiError} On network failure, non-2xx status or an unparseable body.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    // `...init` FIRST, then the keys we derive from it. The other order lets a
    // caller's `init.headers` silently replace the merged object instead of
    // merging into it — which is how `Accept` was being dropped from every POST.
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.headers ?? {}) }
    });
  } catch {
    // fetch only rejects when the request could not be made — DNS, offline, CORS.
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0, 'NETWORK_ERROR');
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      'El servidor respondió algo que no pudimos interpretar.',
      response.status,
      'INVALID_RESPONSE'
    );
  }

  if (!response.ok || (body as ErrorEnvelope).success === false) {
    const envelope = body as ErrorEnvelope;
    throw new ApiError(
      envelope.error?.message ?? 'Ocurrió un error inesperado.',
      response.status,
      envelope.error?.code ?? 'UNKNOWN',
      envelope.error?.fields
    );
  }

  return (body as SuccessEnvelope<T>).data;
}

/** GET helper. */
export function get<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: 'GET' });
}

/** POST helper that serialises `payload` as JSON. */
export function post<T>(path: string, payload: unknown, init?: RequestInit): Promise<T> {
  // Same ordering rule as above: the caller may add headers or an abort signal,
  // but must not be able to override the method and body this helper exists to set.
  return request<T>(path, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    body: JSON.stringify(payload)
  });
}
