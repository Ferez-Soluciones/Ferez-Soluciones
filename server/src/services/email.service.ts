/**
 * LAYER: Services (business logic)
 * Responsibility: deliver notification emails — the "email-service" of the
 * architecture diagram.
 * Must not know about: Express, the filesystem or what a lead is beyond the
 * message it is asked to send.
 *
 * The transport is behind an interface on purpose. Today the default is a console
 * transport that prints the message instead of sending it, so the project runs
 * with zero credentials and a developer can still see exactly what would have
 * been delivered. Wiring a real provider means adding one more object that
 * satisfies `EmailTransport` and selecting it in `resolveTransport()` — no caller
 * changes.
 */
import { env } from '../config/env.js';
import { logger } from '../shared/logger.js';

/** A message ready to be delivered. */
export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  /** Plain text body. No HTML templates: the only recipient is the studio inbox. */
  text: string;
  /** Address to reply to, i.e. the visitor who filled the form. */
  replyTo?: string;
}

/** Anything capable of delivering an `EmailMessage`. */
export interface EmailTransport {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

/**
 * Default transport: writes the message to the server log.
 *
 * Not a placeholder to be replaced before launch — for a landing page whose
 * leads are already persisted in `leads.json`, this is a perfectly serviceable
 * default, and it removes SMTP credentials from the setup entirely.
 */
const consoleTransport: EmailTransport = {
  name: 'console',
  async send(message: EmailMessage): Promise<void> {
    logger.info(
      [
        '',
        '──────────── EMAIL (console transport) ────────────',
        `To:       ${message.to}`,
        `From:     ${message.from}`,
        message.replyTo ? `Reply-To: ${message.replyTo}` : null,
        `Subject:  ${message.subject}`,
        '',
        message.text,
        '───────────────────────────────────────────────────'
      ]
        .filter((line) => line !== null)
        .join('\n')
    );
  }
};

/**
 * Picks the transport described by `EMAIL_TRANSPORT`.
 *
 * An unknown value falls back to the console transport with a warning rather
 * than throwing: a typo in an env var should never stop a landing page from
 * accepting leads, especially since the lead is stored regardless.
 */
function resolveTransport(): EmailTransport {
  switch (env.email.transport) {
    case 'console':
      return consoleTransport;

    // To send for real, add a transport here — e.g. a nodemailer-backed object:
    //
    //   case 'smtp':
    //     return smtpTransport;
    //
    // It only has to expose `name` and `send`, so nothing else in the codebase
    // needs to change.

    default:
      logger.warn(
        `Unknown EMAIL_TRANSPORT "${env.email.transport}". Falling back to the console transport.`
      );
      return consoleTransport;
  }
}

const transport = resolveTransport();

/**
 * Sends a message through the configured transport.
 *
 * @param message - The message to deliver.
 * @throws Whatever the transport throws. Callers decide whether a delivery
 *         failure should fail their own operation — see contact.service.ts.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  await transport.send(message);
}

/** Name of the active transport, used in the startup banner. */
export function activeTransportName(): string {
  return transport.name;
}
