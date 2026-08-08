/**
 * LAYER: Controllers (HTTP)
 * Responsibility: hand the already-validated body to the contact service and
 * answer 201 with a minimal confirmation.
 * Must not know about: repositories, email delivery or validation — the body has
 * been parsed by the `validate` middleware before this runs.
 * Talks only to: contact.service
 *
 * The response deliberately echoes back only the id and timestamp. The visitor
 * has no use for the stored record, and returning less means a public endpoint
 * that never reflects submitted content back to the browser.
 */
import type { CreateLeadDto } from '../domain/dto/contact.dto.js';
import { asyncHandler } from '../shared/async-handler.js';
import { sendSuccess } from '../shared/api-response.js';
import { submitContact } from '../services/contact.service.js';

/** POST /api/contact — store a lead and notify the studio. */
export const createContact = asyncHandler(async (req, res) => {
  const dto = req.body as CreateLeadDto;
  const lead = await submitContact(dto);

  sendSuccess(res, { id: lead.id, createdAt: lead.createdAt }, 201);
});
