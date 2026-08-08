/**
 * Section: Contacto
 * Responsibility: studio contact details and the lead form.
 * Data: POST /api/contact
 * Port of initContactForm() from the legacy js/app.js.
 *
 * The legacy form validated and then did nothing — its submit handler ended with
 * a comment saying the real request went there. This is that request.
 *
 * Validation timing is preserved exactly, because it is a deliberate UX choice:
 * validate on blur (never while someone is still typing their first character),
 * then re-validate on every keystroke ONLY for a field already showing an error,
 * so the message disappears the moment it is fixed.
 *
 * Server errors per field overwrite the client ones: the server is the authority,
 * and it may reject something the three local rules do not cover.
 */
import { useCallback, useRef, useState, type ChangeEvent, type FormEvent, type RefObject } from 'react';

import { ApiError } from '../../api/http.js';
import { sendContact } from '../../api/contact.api.js';
import { BUSINESS_TYPE_OPTIONS, SECTION_HEADINGS, SITE } from '../../content/site.js';
import { useReveal } from '../../hooks/useReveal.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import {
  validateContactForm,
  validateField,
  VALIDATED_FIELDS,
  type FieldErrors,
  type ValidatedField
} from '../../lib/validators.js';

/** Every value the form holds. `negocio` is optional and never validated locally. */
type FormValues = Record<ValidatedField, string> & { negocio: string };

const EMPTY_FORM: FormValues = { nombre: '', email: '', negocio: '', mensaje: '' };

/** What the form is currently doing. Drives the button label and the messages. */
type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

export function Contact() {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [failureMessage, setFailureMessage] = useState('');

  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const setFormRef = useMergedFormRef(formRef);

  /** Updates a value, and clears its error as soon as the input becomes valid. */
  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));

    // Re-validate while typing only if this field is already flagged — otherwise
    // the visitor would be told their half-typed email is wrong.
    if (field !== 'negocio' && errors[field]) {
      const message = validateField(field, value);
      setErrors((current) => {
        const next = { ...current };
        if (message) next[field] = message;
        else delete next[field];
        return next;
      });
    }
  };

  /** Validates a single field when it loses focus. */
  const handleBlur = (field: ValidatedField) => {
    const message = validateField(field, values[field]);
    setErrors((current) => {
      const next = { ...current };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  /** Moves focus to the first invalid input, top to bottom. */
  const focusFirstInvalid = (fieldErrors: FieldErrors) => {
    const firstInvalid = VALIDATED_FIELDS.find((field) => fieldErrors[field]);
    if (!firstInvalid) return;

    const element = formRef.current?.elements.namedItem(firstInvalid);
    if (element instanceof HTMLElement) element.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientErrors = validateContactForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setStatus('idle');
      focusFirstInvalid(clientErrors);
      return;
    }

    setStatus('sending');
    setFailureMessage('');

    try {
      await sendContact(values);

      setStatus('success');
      setValues(EMPTY_FORM);
      setErrors({});

      // Scroll the confirmation into view: on mobile the submit button can sit
      // above the fold and the message would appear off-screen.
      successRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    } catch (cause) {
      setStatus('error');

      if (cause instanceof ApiError && cause.fields) {
        // The server rejected specific fields — show them inline, exactly like a
        // local validation failure, and jump to the first one.
        setErrors(cause.fields);
        focusFirstInvalid(cause.fields);
        setFailureMessage('');
        return;
      }

      setFailureMessage(
        cause instanceof ApiError
          ? cause.message
          : 'No pudimos enviar tu consulta. Probá de nuevo en unos minutos.'
      );
    }
  };

  const isSending = status === 'sending';

  return (
    <section className="section contact" id="contacto" aria-labelledby="contacto-title">
      <div className="container contact__inner">
        <div className="contact__intro">
          <p className="eyebrow" data-reveal ref={useReveal<HTMLParagraphElement>()}>
            {SECTION_HEADINGS.contact.eyebrow}
          </p>
          <h2 className="section__title" id="contacto-title" data-reveal ref={useReveal<HTMLHeadingElement>()}>
            {SECTION_HEADINGS.contact.title}
          </h2>
          <p className="section__lead" data-reveal ref={useReveal<HTMLParagraphElement>()}>
            {SECTION_HEADINGS.contact.lead}
          </p>

          <ul className="contact__list" data-reveal ref={useReveal<HTMLUListElement>()}>
            <li className="contact__item">
              <span className="contact__label">Email</span>
              <a className="contact__value" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
            </li>
            <li className="contact__item">
              <span className="contact__label">WhatsApp</span>
              <a
                className="contact__value"
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE.phoneDisplay}
              </a>
            </li>
            <li className="contact__item">
              <span className="contact__label">Horario</span>
              <span className="contact__value">{SITE.scheduleLabel}</span>
            </li>
          </ul>
        </div>

        {/* noValidate: the browser's own bubbles would compete with our messages
            and cannot be styled or translated consistently. */}
        <form
          className="form"
          id="contactForm"
          noValidate
          data-reveal
          ref={setFormRef}
          onSubmit={handleSubmit}
        >
          <Field
            id="nombre"
            label="Nombre y apellido"
            required
            autoComplete="name"
            placeholder="Ana Martínez"
            value={values.nombre}
            error={errors['nombre']}
            onChange={(value) => handleChange('nombre', value)}
            onBlur={() => handleBlur('nombre')}
          />

          <Field
            id="email"
            type="email"
            label="Email"
            required
            autoComplete="email"
            placeholder="ana@tunegocio.com"
            value={values.email}
            error={errors['email']}
            onChange={(value) => handleChange('email', value)}
            onBlur={() => handleBlur('email')}
          />

          <div className="form__row">
            <label className="form__label" htmlFor="negocio">
              Rubro de tu negocio
            </label>
            <select
              className="form__input form__input--select"
              id="negocio"
              name="negocio"
              value={values.negocio}
              onChange={(event) => handleChange('negocio', event.target.value)}
            >
              <option value="">Seleccioná una opción</option>
              {BUSINESS_TYPE_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Field
            id="mensaje"
            label="¿Qué necesitás?"
            required
            multiline
            placeholder="Contanos brevemente qué hace tu negocio y qué querés lograr con la web."
            value={values.mensaje}
            error={errors['mensaje']}
            onChange={(value) => handleChange('mensaje', value)}
            onBlur={() => handleBlur('mensaje')}
          />

          <button className="btn btn--primary btn--block" type="submit" disabled={isSending}>
            {isSending ? 'Enviando…' : 'Enviar consulta'}
          </button>

          <p className="form__note">
            Al enviar aceptás que te contactemos por email. No compartimos tus datos.
          </p>

          {/* role="status" announces politely, without interrupting what the
              screen reader is currently reading. */}
          <p className="form__success" role="status" ref={successRef} hidden={status !== 'success'}>
            ¡Gracias! Recibimos tu consulta y te escribimos dentro de las próximas 24 horas hábiles.
          </p>

          {/* role="alert" interrupts: a failed submission is worth interrupting for. */}
          <p className="form__failure" role="alert" hidden={!failureMessage}>
            {failureMessage}
          </p>
        </form>
      </div>
    </section>
  );
}

interface FieldProps {
  id: ValidatedField;
  label: string;
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  autoComplete?: string;
}

/**
 * One labelled input with its inline error.
 *
 * Extracted because the wiring repeats three times and every piece of it matters:
 * `htmlFor`/`id` pair the label to the control, `aria-describedby` attaches the
 * error message to it, `aria-invalid` marks the state, and `role="alert"` on the
 * message makes it announced when it appears.
 */
function Field({
  id,
  label,
  value,
  error,
  onChange,
  onBlur,
  type = 'text',
  required = false,
  multiline = false,
  placeholder,
  autoComplete
}: FieldProps) {
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  /** Props shared by the <input> and <textarea> branches. */
  const sharedProps = {
    id,
    name: id,
    value,
    placeholder,
    required,
    'aria-describedby': errorId,
    'aria-invalid': hasError,
    className: `form__input${multiline ? ' form__input--textarea' : ''}${hasError ? ' is-invalid' : ''}`,
    onBlur,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value)
  };

  return (
    <div className="form__row">
      <label className="form__label" htmlFor={id}>
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </label>

      {multiline ? (
        <textarea rows={4} {...sharedProps} />
      ) : (
        <input type={type} autoComplete={autoComplete} {...sharedProps} />
      )}

      <p className="form__error" id={errorId} role="alert" hidden={!hasError}>
        {error}
      </p>
    </div>
  );
}

/**
 * Combines the form ref with the reveal ref.
 *
 * The <form> needs both: `useReveal` to fade in, and `formRef` to look up inputs
 * by name when focusing the first invalid one. React only accepts a single ref
 * per element, so they are merged here rather than dropping one of them.
 *
 * Memoised deliberately. A fresh callback on every render would make React
 * detach and reattach the ref each time, which for this component means the
 * IntersectionObserver churning on every keystroke in the form.
 */
function useMergedFormRef(formRef: RefObject<HTMLFormElement>) {
  const revealRef = useReveal<HTMLFormElement>();

  return useCallback(
    (node: HTMLFormElement | null) => {
      revealRef(node);
      (formRef as { current: HTMLFormElement | null }).current = node;
    },
    [revealRef, formRef]
  );
}
