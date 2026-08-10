/**
 * LAYER: Domain (data transfer objects)
 * Responsibility: define and validate the payload accepted by POST /api/contact.
 * Must not know about: Express. It only describes the shape, the `validate`
 * middleware is the one that plugs this schema into the request pipeline.
 *
 * This schema is the single source of truth for what a valid contact submission
 * is. The React form runs the same three rules for instant feedback, but that is
 * only UX: a request that reaches the server is always re-validated here.
 *
 * Field names and messages stay in Spanish on purpose — they must match the form
 * inputs (`name="nombre"`, `name="email"`, ...) and the messages are shown to the
 * visitor next to each field.
 */
import { z } from 'zod';

/** Categories offered by the form's select. Mirrors the portfolio filters plus "otro". */
export const BUSINESS_TYPES = ['gastronomia', 'salud', 'servicios', 'retail', 'otro'] as const;

/**
 * Same regex the legacy site used. Deliberately permissive: the goal is to catch
 * typos, not to implement RFC 5322 — rejecting a real address costs a lead,
 * while accepting a bogus one costs one unanswered notification.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const createLeadSchema = z.object({
  nombre: z
    .string({ required_error: 'Escribí tu nombre.' })
    .trim()
    .min(1, 'Escribí tu nombre.')
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(80, 'El nombre es demasiado largo.'),

  email: z
    .string({ required_error: 'Escribí tu email.' })
    .trim()
    .min(1, 'Escribí tu email.')
    .max(160, 'El email es demasiado largo.')
    .regex(EMAIL_PATTERN, 'Ingresá un email válido, por ejemplo ana@tunegocio.com'),

  // The select is optional: an empty string means "no eligió rubro" and is
  // normalised to null so the stored lead never carries an empty string around.
  negocio: z
    .union([z.enum(BUSINESS_TYPES), z.literal('')])
    .optional()
    .transform((value) => (value ? value : null)),

  mensaje: z
    .string({ required_error: 'Contanos brevemente qué necesitás.' })
    .trim()
    .min(1, 'Contanos brevemente qué necesitás.')
    .min(15, 'Agregá un poco más de detalle (mínimo 15 caracteres).')
    .max(2000, 'El mensaje es demasiado largo (máximo 2000 caracteres).')
});

/** Validated and normalised contact payload handed to the contact service. */
export type CreateLeadDto = z.infer<typeof createLeadSchema>;
