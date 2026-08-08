/**
 * Component: SectionHeader
 * Responsibility: the eyebrow + title + optional lead trio every section opens with.
 *
 * Extracted because it repeats six times and carries an accessibility contract
 * that is easy to get wrong by hand: the `<h2>` id must match the section's
 * `aria-labelledby`, which is what lets screen reader users list the page's
 * regions by name.
 */
import { useReveal } from '../../hooks/useReveal.js';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Id given to the <h2>. The parent <section> must point at it via aria-labelledby. */
  titleId: string;
}

export function SectionHeader({ eyebrow, title, lead, titleId }: SectionHeaderProps) {
  return (
    <header className="section__head">
      <p className="eyebrow" data-reveal ref={useReveal<HTMLParagraphElement>()}>
        {eyebrow}
      </p>
      <h2 className="section__title" id={titleId} data-reveal ref={useReveal<HTMLHeadingElement>()}>
        {title}
      </h2>
      {lead ? (
        <p className="section__lead" data-reveal ref={useReveal<HTMLParagraphElement>()}>
          {lead}
        </p>
      ) : null}
    </header>
  );
}
