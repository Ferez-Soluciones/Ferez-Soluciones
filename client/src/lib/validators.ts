/**
 * Client validation rules for the contact form.
 * Port of the `rules` object inside initContactForm() in the legacy js/app.js.
 *
 * These three rules are intentionally a copy of the server's zod schema
 * (server/src/domain/dto/contact.dto.ts). The duplication buys instant feedback
 * on blur without a round trip; the server remains the authority and re-validates
 * everything, so the worst case of the two drifting apart is a message shown a
 * moment later rather than an invalid lead getting through.
 *
 * Messages stay in Spanish: they are rendered next to each input.
 */

/** Per-field error messages, keyed by input name. Matches the server's shape. */
export type FieldErrors = Record<string, string>;

/** Same permissive pattern as the server — catches typos, not RFC violations. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Names of the fields that carry validation. `negocio` is optional and unchecked. */
export type ValidatedField = 'nombre' | 'email' | 'mensaje';

/** Order used when focusing the first invalid field — matches the visual order. */
export const VALIDATED_FIELDS: readonly ValidatedField[] = ['nombre', 'email', 'mensaje'];

/**
 * Validates one field.
 *
 * @param field - Which rule to apply.
 * @param value - Raw input value.
 * @returns The error message, or an empty string when the value is valid.
 */
export function validateField(field: ValidatedField, value: string): string {
  const trimmed = value.trim();

  switch (field) {
    case 'nombre':
      if (!trimmed) return 'Escribí tu nombre.';
      if (trimmed.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      return '';

    case 'email':
      if (!trimmed) return 'Escribí tu email.';
      if (!EMAIL_PATTERN.test(trimmed)) return 'Ingresá un email válido, por ejemplo ana@tunegocio.com';
      return '';

    case 'mensaje':
      if (!trimmed) return 'Contanos brevemente qué necesitás.';
      if (trimmed.length < 15) return 'Agregá un poco más de detalle (mínimo 15 caracteres).';
      return '';
  }
}

/**
 * Validates every field of the form.
 *
 * @param values - Current form values.
 * @returns A map with one entry per invalid field. Empty when the form is valid.
 */
export function validateContactForm(values: Record<ValidatedField, string>): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of VALIDATED_FIELDS) {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  }

  return errors;
}
