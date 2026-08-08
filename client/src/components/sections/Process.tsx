/**
 * Section: Proceso
 * Responsibility: the four delivery steps.
 *
 * Static content: these steps describe how the studio works, not data it edits,
 * so they live in content/site.ts and never touch the API.
 *
 * Marked up as an ordered list because the steps genuinely happen in sequence —
 * that ordering is information, and `<ol>` is how it reaches assistive tech. The
 * "01…04" numerals are decorative duplicates of that semantics, hence aria-hidden.
 */
import { PROCESS_STEPS, SECTION_HEADINGS } from '../../content/site.js';
import { useReveal } from '../../hooks/useReveal.js';
import { SectionHeader } from '../ui/SectionHeader.js';

export function Process() {
  return (
    <section className="section section--alt" id="proceso" aria-labelledby="proceso-title">
      <div className="container">
        <SectionHeader
          eyebrow={SECTION_HEADINGS.process.eyebrow}
          title={SECTION_HEADINGS.process.title}
          lead={SECTION_HEADINGS.process.lead}
          titleId="proceso-title"
        />

        <ol className="steps">
          {PROCESS_STEPS.map((step) => (
            <ProcessStep key={step.number} step={step} />
          ))}
        </ol>
      </div>
    </section>
  );
}

/** One step. Split out so each list item can own its reveal ref. */
function ProcessStep({ step }: { step: (typeof PROCESS_STEPS)[number] }) {
  return (
    <li className="step" data-reveal ref={useReveal<HTMLLIElement>()}>
      <span className="step__num" aria-hidden="true">
        {step.number}
      </span>
      <div className="step__body">
        <h3 className="step__title">{step.title}</h3>
        <p className="step__text">{step.text}</p>
        <span className="step__meta">{step.meta}</span>
      </div>
    </li>
  );
}
