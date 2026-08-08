/**
 * LAYER: Services (business logic)
 * Responsibility: orchestrate what happens when a visitor submits the contact
 * form — the branch of the diagram where one controller fans out to a repository
 * and to the email service.
 * Must not know about: Express (req/res) or the filesystem.
 * Talks to: repositories.leads, email.service
 */
import type { Lead } from '../domain/entities.js';
import type { CreateLeadDto } from '../domain/dto/contact.dto.js';
import { repositories } from '../repositories/index.js';
import { ApiError } from '../shared/api-error.js';
import { logger } from '../shared/logger.js';
import { env } from '../config/env.js';
import { sendEmail } from './email.service.js';

/** Human readable labels for the business types offered by the form. */
const BUSINESS_TYPE_LABELS: Record<string, string> = {
  gastronomia: 'Gastronomía',
  salud: 'Salud y bienestar',
  servicios: 'Servicios profesionales',
  retail: 'Comercio y retail',
  otro: 'Otro'
};

/**
 * Stores a contact submission and notifies the studio.
 *
 * The order matters: the lead is persisted FIRST, then the notification is
 * attempted — so a delivery problem can never cost a lead that could have been
 * saved.
 *
 * How a failed email is treated depends on whether that storage is real, which
 * is what `leads.isDurable` reports:
 *
 * - Durable storage (a normal server with a disk): the lead is already safe in
 *   `leads.json`, so the failure is logged and the visitor still gets a success
 *   response. Failing the request would throw away a real lead over a problem
 *   the visitor can do nothing about.
 * - Ephemeral storage (serverless): there is no second copy. The email IS the
 *   lead, so failing to send it has to fail the request — answering "¡Gracias!"
 *   while the message evaporates is the worst possible outcome for a landing
 *   page whose entire purpose is collecting these.
 *
 * @param dto - Payload already validated by `createLeadSchema`.
 * @returns The stored lead, with its generated id and timestamp.
 * @throws {ApiError} 502 when the lead could be neither stored durably nor sent.
 */
export async function submitContact(dto: CreateLeadDto): Promise<Lead> {
  const lead = await repositories.leads.create({
    name: dto.nombre,
    email: dto.email,
    businessType: dto.negocio,
    message: dto.mensaje,
    source: 'landing-contact-form'
  });

  try {
    await sendEmail({
      to: env.email.to,
      from: env.email.from,
      replyTo: lead.email,
      subject: `Nueva consulta de ${lead.name}`,
      text: buildNotificationBody(lead)
    });
  } catch (error) {
    if (repositories.leads.isDurable) {
      logger.error(`Lead ${lead.id} was stored but the notification email failed.`, error);
      return lead;
    }

    logger.error(`Lead ${lead.id} could not be stored nor delivered — rejecting the request.`, error);

    // Point the visitor at a channel that does not depend on this server, so a
    // broken notification pipeline does not cost the studio the conversation.
    throw new ApiError(
      502,
      `No pudimos registrar tu consulta. Escribinos directamente a ${env.email.to} o por WhatsApp.`,
      'CONTACT_DELIVERY_FAILED'
    );
  }

  return lead;
}

/** Renders the plain-text body of the notification email. */
function buildNotificationBody(lead: Lead): string {
  const businessType = lead.businessType
    ? (BUSINESS_TYPE_LABELS[lead.businessType] ?? lead.businessType)
    : 'Sin especificar';

  return [
    `Nombre:  ${lead.name}`,
    `Email:   ${lead.email}`,
    `Rubro:   ${businessType}`,
    `Fecha:   ${lead.createdAt}`,
    '',
    'Mensaje:',
    lead.message
  ].join('\n');
}
