/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: read the portfolio case studies from `data/projects.json`.
 * Must not know about: HTTP or business rules.
 *
 * `findByCategory` is a plain equality match — deciding what "all" means, or
 * whether an unknown category is an error, is a business rule and belongs to
 * project.service.ts, not here.
 */
import projectsData from '../../data/projects.json' with { type: 'json' };

import type { Project } from '../../domain/entities.js';
import type { ProjectRepository } from '../contracts.js';
import { byOrder } from '../../shared/sort.js';

const projects = projectsData as unknown as Project[];

export const jsonProjectRepository: ProjectRepository = {
  /** Returns every project, sorted for display. */
  async findAll(): Promise<Project[]> {
    return [...projects].sort(byOrder);
  },

  /**
   * Returns the projects whose category matches exactly.
   *
   * @param category - Category slug, e.g. "gastronomia".
   * @returns Matching projects, sorted. Empty array when nothing matches.
   */
  async findByCategory(category: string): Promise<Project[]> {
    return projects.filter((project) => project.category === category).sort(byOrder);
  }
};
