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

  /**
   * Whether a resolved `send()` means the message actually left the building.
   *
   * This is NOT the same as "did not throw", and the difference is what makes it
   * worth a flag. The console transport always resolves — it just prints — so a
   * caller checking only for exceptions would conclude the mail went out. On a
   * host with no durable storage that mistake silently destroys leads, so the
   * contact service reads this instead of trusting the absence of an error.
   */
  readonly guaranteesDelivery: boolean;

  send(message: EmailMessage): Promise<void>;
}

/**
 * Default transport: writes the message to the server log.
 *
 * Fine for local development, and fine in production too — but only where the
 * lead is also written to disk, because printing is not delivering. See
 * `guaranteesDelivery` and the boot check in `assertDeliveryPathIsSound()`.
 */
const consoleTransport: EmailTransport = {
  name: 'console',
  guaranteesDelivery: false,
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
 * Production transport: delivers through the Resend HTTP API.
 *
 * Chosen over SMTP because it needs no long-lived connection, which is what a
 * serverless function can actually do — and no dependency either, since it is a
 * single `fetch` against a JSON endpoint.
 *
 * Note on addresses: Resend only accepts a `from` on a domain verified in your
 * account, so `CONTACT_FROM` cannot be the Gmail inbox that receives the mail.
 * `onboarding@resend.dev` works until a domain is set up. `replyTo` carries the
 * visitor's address, so hitting reply always answers the right person.
 */
const resendTransport: EmailTransport = {
  name: 'resend',
  guaranteesDelivery: true,
  async send(message: EmailMessage): Promise<void> {
    if (!env.email.resendApiKey) {
      throw new Error('RESEND_API_KEY is not set — cannot send the notification email.');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.email.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: message.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {})
      })
    });

    if (!response.ok) {
      // Include the body: Resend explains rejections (unverified domain, bad
      // key) in it, and without that the failure is impossible to diagnose.
      const detail = await response.text().catch(() => '');
      throw new Error(`Resend rejected the message (${response.status}): ${detail}`);
    }
  }
};

/**
 * Picks the transport described by `EMAIL_TRANSPORT`.
 *
 * An unknown value falls back to the console transport with a warning rather
 * than throwing: a typo in an env var should not stop the server from booting.
 * Whether a failed delivery is fatal for a given request is decided by
 * contact.service.ts, which knows if the lead was stored anywhere else.
 */
function resolveTransport(): EmailTransport {
  switch (env.email.transport) {
    case 'console':
      return consoleTransport;

    case 'resend':
      return resendTransport;

    // Any other provider only has to expose `name` and `send`, so adding one is
    // a new object here and a new case — nothing else in the codebase changes.

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

/**
 * Whether the active transport actually delivers, as opposed to merely not
 * failing. Read by contact.service.ts to decide if a submission can be accepted.
 */
export function transportGuaranteesDelivery(): boolean {
  return transport.guaranteesDelivery;
}

/**
 * Warns at boot when the deployment cannot keep a lead by any route.
 *
 * Called from the entry point rather than left to the first submission: on a
 * serverless host the failure is invisible from the outside — the form answers
 * 502 and there is nothing in the inbox to notice — so the operator has to learn
 * about it from the startup logs, not from the leads that never arrive.
 *
 * @param storageIsDurable - Whether the selected lead repository survives the process.
 */
export function assertDeliveryPathIsSound(storageIsDurable: boolean): void {
  if (storageIsDurable || transport.guaranteesDelivery) return;

  logger.error(
    `Leads CANNOT be kept: storage is ephemeral and EMAIL_TRANSPORT="${transport.name}" does not deliver. ` +
      'The contact form will reject every submission with 502 until this is fixed. ' +
      'Set EMAIL_TRANSPORT=resend and RESEND_API_KEY.'
  );
}
