/**
 * LAYER: Routes
 * Responsibility: map the contact endpoint to its middleware chain.
 *
 * The order of the chain is the whole point of this file: rate limit first (cheap,
 * rejects abuse before any parsing work), validation second (rejects malformed
 * payloads before business logic), controller last.
 */
import { Router } from 'express';

import { env } from '../config/env.js';
import { createContact } from '../controllers/contact.controller.js';
import { createLeadSchema } from '../domain/dto/contact.dto.js';
import { rateLimit } from '../middlewares/rate-limit.js';
import { validateBody } from '../middlewares/validate.js';

export const contactRoutes = Router();

contactRoutes.post(
  '/contact',
  rateLimit({
    max: env.contactRateLimit.max,
    windowMs: env.contactRateLimit.windowMs,
    message: 'Recibimos varias consultas tuyas hace poco. Probá de nuevo en un rato.'
  }),
  validateBody(createLeadSchema),
  createContact
);
