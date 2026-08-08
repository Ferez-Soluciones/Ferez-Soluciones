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
 * attempted. If the email fails the lead is already safe on disk, so the visitor
 * still gets a success response and the studio can recover the message from
 * `leads.json`. Failing the request instead would throw away a real lead over a
 * delivery problem the visitor can do nothing about — which is why the email
 * error is logged and swallowed rather than rethrown.
 *
 * @param dto - Payload already validated by `createLeadSchema`.
 * @returns The stored lead, with its generated id and timestamp.
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
    logger.error(`Lead ${lead.id} was stored but the notification email failed.`, error);
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
