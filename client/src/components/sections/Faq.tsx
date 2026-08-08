/**
 * Section: FAQ
 * Responsibility: the accordion of frequent questions.
 * Data: GET /api/faqs
 * Port of initAccordion() from the legacy js/app.js.
 *
 * Exclusive accordion: opening one panel closes the rest, which is why the open
 * item is a single id in state rather than a set.
 *
 * The accessibility contract is the part worth not improvising:
 * - the trigger is a real <button> inside the heading, so it is reachable by
 *   keyboard and listed in the page's heading outline;
 * - `aria-expanded` announces the state, `aria-controls` points at the panel;
 * - the panel uses the `hidden` attribute (not display:none from a class), so it
 *   is genuinely removed from the accessibility tree when closed;
 * - `role="region"` + `aria-labelledby` let a screen reader jump to the answer
 *   and know which question it belongs to.
 */
import { useState } from 'react';

import { getFaqs } from '../../api/content.api.js';
import { SECTION_HEADINGS } from '../../content/site.js';
import { useApi } from '../../hooks/useApi.js';
import type { Faq as FaqEntry } from '../../types/api.js';
import { ErrorState } from '../ui/ErrorState.js';
import { SectionHeader } from '../ui/SectionHeader.js';
import { SkeletonLines } from '../ui/Skeleton.js';

export function Faq() {
  const { data: faqs, loading, error, retry } = useApi<FaqEntry[]>((signal) => getFaqs(signal));
  const [openId, setOpenId] = useState<string | null>(null);

  /** Toggles an item, closing whichever one was open. */
  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container container--narrow">
        <SectionHeader
          eyebrow={SECTION_HEADINGS.faq.eyebrow}
          title={SECTION_HEADINGS.faq.title}
          titleId="faq-title"
        />

        {loading && !faqs ? <SkeletonLines count={5} /> : null}

        {error ? <ErrorState message={error} onRetry={retry} /> : null}

        {faqs ? (
          <div className="accordion" id="accordion">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              const buttonId = `faq-${faq.id}-btn`;
              const panelId = `faq-${faq.id}-panel`;

              return (
                <div className="accordion__item" key={faq.id}>
                  <h3 className="accordion__heading">
                    <button
                      className="accordion__trigger"
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(faq.id)}
                    >
                      <span>{faq.question}</span>
                      {/* Plus/minus drawn in CSS from aria-expanded. */}
                      <span className="accordion__icon" aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    className="accordion__panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!isOpen}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
