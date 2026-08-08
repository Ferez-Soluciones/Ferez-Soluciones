/**
 * LAYER: Services (business logic)
 * Responsibility: resolve portfolio content and apply the category filtering.
 * Must not know about: Express (req/res) or the filesystem.
 * Talks only to: repositories.projects
 */
import type { Project } from '../domain/entities.js';
import { repositories } from '../repositories/index.js';

/**
 * Sentinel used by the portfolio filter buttons to mean "no filtering".
 * It is a business concept, not an HTTP one, which is why it is defined here and
 * not in the controller.
 */
export const ALL_CATEGORIES = 'all';

/**
 * Returns the projects that belong to a category.
 *
 * The filter lives here — and not in the controller or the repository — because
 * "which projects match a category" is a business rule: the controller only
 * parses the query string, and the repository only knows how to read records.
 *
 * An unknown category is deliberately NOT an error. The client renders an empty
 * state ("No hay proyectos en esta categoría todavía."), so answering 200 with an
 * empty list is both simpler for the UI and truthful: nothing matched.
 *
 * @param category - Category slug, or "all"/undefined to skip filtering.
 * @returns Matching projects in display order.
 */
export async function listProjects(category?: string): Promise<Project[]> {
  if (!category || category === ALL_CATEGORIES) {
    return repositories.projects.findAll();
  }

  return repositories.projects.findByCategory(category);
}

/**
 * Returns the distinct categories present in the portfolio, in display order.
 *
 * Derived from the projects themselves rather than hardcoded, so adding a
 * project in a new rubro is enough to make its filter button appear.
 *
 * @returns One entry per category, with its human readable label.
 */
export async function listProjectCategories(): Promise<Array<{ slug: string; label: string }>> {
  const projects = await repositories.projects.findAll();
  const seen = new Map<string, string>();

  for (const project of projects) {
    if (!seen.has(project.category)) {
      seen.set(project.category, project.categoryLabel);
    }
  }

  return [...seen].map(([slug, label]) => ({ slug, label }));
}
