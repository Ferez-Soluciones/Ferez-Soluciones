/**
 * Component: WhatsAppFab
 * Responsibility: the floating WhatsApp button.
 *
 * The icon carries no text, so the link needs an explicit `aria-label` — without
 * it a screen reader would announce "link" and nothing more. `rel="noopener
 * noreferrer"` is required on every `target="_blank"` link: it stops the opened
 * page from reaching back into this one via `window.opener`.
 */
import { SITE } from '../../content/site.js';
import { WhatsAppGlyph } from '../ui/Icon.js';

export function WhatsAppFab() {
  return (
    <a
      className="whatsapp-fab"
      href={SITE.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
    >
      <WhatsAppGlyph />
    </a>
  );
}
