/**
 * Component: Icon
 * Responsibility: render the inline SVGs of the site.
 *
 * The original site shipped zero image files — every icon is inline SVG so it
 * inherits `currentColor` and costs no extra request. That is kept here, with
 * one addition: the service cards get their icon from the API (`service.icon`),
 * so the mapping from a string key to a shape has to live somewhere. This is it.
 *
 * All icons are decorative — the surrounding heading already names them — so
 * they are hidden from assistive technology.
 */
import type { JSX } from 'react';

/** Icon keys used by `services.json`. */
export type IconName = 'browser' | 'mobile' | 'search' | 'bolt' | 'chat' | 'chart';

interface IconProps {
  name: string;
  size?: number;
}

/** Stroke settings shared by every service icon, matching the legacy markup. */
const STROKE_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
} as const;

/** Path geometry per icon key. */
const PATHS: Record<IconName, JSX.Element> = {
  browser: (
    <>
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </>
  ),
  mobile: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  chat: (
    <>
      <path d="M4 4h16v12H7l-3 3V4Z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  chart: (
    <>
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 3v9h9" />
    </>
  )
};

/**
 * Renders a service icon by key.
 *
 * Unknown keys render nothing rather than throwing: a typo in the content data
 * should cost an icon, not the whole section.
 */
export function Icon({ name, size = 24 }: IconProps) {
  const path = PATHS[name as IconName];
  if (!path) return null;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...STROKE_PROPS}>
      {path}
    </svg>
  );
}

/** The triangular brand mark, used by the header and the footer logos. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      className="logo__mark"
      width={size}
      height={size}
      viewBox="0 0 28 28"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 2 26 24H2L14 2Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 11 19.5 21h-11L14 11Z" fill="currentColor" />
    </svg>
  );
}

/** WhatsApp glyph for the floating action button. */
export function WhatsAppGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />
    </svg>
  );
}
