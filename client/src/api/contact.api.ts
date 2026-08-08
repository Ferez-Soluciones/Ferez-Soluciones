/**
 * Client API layer — contact endpoint.
 * Responsibility: submit the contact form.
 * Must not know about: React or rendering.
 */
import type { ContactReceipt } from '../types/api.js';
import { post } from './http.js';

/**
 * Payload accepted by POST /api/contact.
 *
 * Field names are Spanish because they mirror the form inputs and the server's
 * zod schema, which validates exactly these keys.
 */
export interface ContactPayload {
  nombre: string;
  email: string;
  negocio: string;
  mensaje: string;
}

/**
 * Sends a contact submission.
 *
 * @param payload - The form values.
 * @returns The stored lead's id and timestamp.
 * @throws {ApiError} With `fields` populated when the server rejects a field.
 */
export function sendContact(payload: ContactPayload, signal?: AbortSignal): Promise<ContactReceipt> {
  return post<ContactReceipt>('/contact', payload, { signal });
}
