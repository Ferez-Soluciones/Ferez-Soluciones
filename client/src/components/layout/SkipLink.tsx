/**
 * Component: SkipLink
 * Responsibility: let keyboard users jump straight to the content.
 *
 * It must be the first focusable element in the document, which is why it is
 * rendered before the header. It is visually offscreen until focused (see the
 * `.skip-link` block), so it costs nothing to sighted users while saving keyboard
 * users from tabbing through the whole nav on every visit.
 */

export function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      Saltar al contenido principal
    </a>
  );
}
