/**
 * Component: Skeleton placeholders
 * Responsibility: hold the layout while an API-driven section loads.
 *
 * The sections below the hero come from the API, so on a slow connection they
 * would otherwise be blank boxes that push the page around when data lands.
 * These reuse the `.skeleton` block the hero mockup already defines — no new
 * styles, and the shimmer stops automatically under reduced motion via the
 * global CSS rule.
 *
 * They are `aria-hidden` and announced by their container's `aria-busy` instead:
 * a screen reader should hear "loading", not a description of grey rectangles.
 */

interface SkeletonGridProps {
  /** How many placeholder cards to render. Match the real count to avoid a jump. */
  count: number;
  /** Grid wrapper class, e.g. "cards" or "projects". */
  className: string;
  /** Height of each placeholder card. */
  height?: number;
}

/** A grid of blank cards, shaped like the content that will replace it. */
export function SkeletonGrid({ count, className, height = 210 }: SkeletonGridProps) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}

/** A stack of blank lines, used where the content is text rather than cards. */
export function SkeletonLines({ count = 5 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton" style={{ height: 56, marginBottom: 12 }} />
      ))}
    </div>
  );
}
