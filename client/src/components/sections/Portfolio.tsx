/**
 * Section: Portfolio
 * Responsibility: the case-study grid and its category filter.
 * Data: GET /api/projects/categories and GET /api/projects?category=…
 * Port of initPortfolioFilters() from the legacy js/app.js.
 *
 * One behavioural change from the legacy site, and it is the point of the
 * rebuild: filtering is no longer a class toggle over markup that is already in
 * the DOM. Clicking a filter refetches from the API, so the rule that decides
 * which projects belong to a rubro lives in project.service.ts on the server —
 * one implementation, not one per client.
 *
 * `useApi` keeps the previous results while the new ones are in flight, so the
 * grid dims instead of collapsing and the page never jumps under the cursor.
 * The grid is `aria-live="polite"`, which is what announces the new results to a
 * screen reader user after a filter click — without it the change would be silent.
 */
import { useCallback, useState } from 'react';

import { getProjectCategories, getProjects } from '../../api/content.api.js';
import { SECTION_HEADINGS } from '../../content/site.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal } from '../../hooks/useReveal.js';
import type { Project, ProjectCategory } from '../../types/api.js';
import { ErrorState } from '../ui/ErrorState.js';
import { SectionHeader } from '../ui/SectionHeader.js';
import { SkeletonGrid } from '../ui/Skeleton.js';

/** Sentinel for "no filter". Matches ALL_CATEGORIES on the server. */
const ALL = 'all';

export function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<string>(ALL);

  const { data: categories } = useApi<ProjectCategory[]>((signal) => getProjectCategories(signal));

  const fetchProjects = useCallback(
    (signal: AbortSignal) => getProjects(activeFilter, signal),
    [activeFilter]
  );
  const { data: projects, loading, error, retry } = useApi<Project[]>(fetchProjects, [activeFilter]);

  const isEmpty = projects !== null && projects.length === 0;

  return (
    <section className="section" id="portfolio" aria-labelledby="portfolio-title">
      <div className="container">
        <SectionHeader
          eyebrow={SECTION_HEADINGS.portfolio.eyebrow}
          title={SECTION_HEADINGS.portfolio.title}
          lead={SECTION_HEADINGS.portfolio.lead}
          titleId="portfolio-title"
        />

        <div className="filters" role="group" aria-label="Filtrar proyectos por rubro">
          <FilterButton
            label="Todos"
            slug={ALL}
            isActive={activeFilter === ALL}
            onSelect={setActiveFilter}
          />
          {(categories ?? []).map((category) => (
            <FilterButton
              key={category.slug}
              label={category.label}
              slug={category.slug}
              isActive={activeFilter === category.slug}
              onSelect={setActiveFilter}
            />
          ))}
        </div>

        {loading && !projects ? <SkeletonGrid className="projects" count={6} height={320} /> : null}

        {error ? <ErrorState message={error} onRetry={retry} /> : null}

        {/*
          The live region wraps BOTH outcomes and is never unmounted while the
          section is on screen. A live region only announces changes that happen
          inside an element the screen reader is already watching — the previous
          version put `aria-live` on the results grid itself, so filtering to an
          empty category destroyed the region and rendered the empty message
          outside it. The one change most worth announcing was the one nobody heard.
        */}
        <div id="projects-live" aria-live="polite" aria-busy={loading}>
          {projects && projects.length > 0 ? (
            <div className={`projects${loading ? ' is-loading' : ''}`} id="projects">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}

          {isEmpty && !error ? (
            <p className="projects__empty" id="projectsEmpty">
              No hay proyectos en esta categoría todavía.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

interface FilterButtonProps {
  label: string;
  slug: string;
  isActive: boolean;
  onSelect: (slug: string) => void;
}

/**
 * One filter button.
 *
 * `aria-pressed` is what makes these announce as toggle buttons: the visual
 * "active" pill means nothing without it.
 */
function FilterButton({ label, slug, isActive, onSelect }: FilterButtonProps) {
  return (
    <button
      className={`filters__btn${isActive ? ' is-active' : ''}`}
      type="button"
      aria-pressed={isActive}
      onClick={() => onSelect(slug)}
    >
      {label}
    </button>
  );
}

/** One case study card. */
function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project" data-reveal ref={useReveal<HTMLElement>()}>
      {/* Decorative gradient tile with the client's initials — no image assets. */}
      <div className={`project__thumb project__thumb--${project.thumbVariant}`} aria-hidden="true">
        <span className="project__initials">{project.initials}</span>
      </div>
      <div className="project__body">
        <p className="project__tag">{project.categoryLabel}</p>
        <h3 className="project__title">{project.name}</h3>
        <p className="project__text">{project.description}</p>
        <p className="project__result">
          <strong>{project.metricValue}</strong> {project.metricLabel}
        </p>
      </div>
    </article>
  );
}
