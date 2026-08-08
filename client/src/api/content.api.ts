/**
 * Client API layer — content endpoints.
 * Responsibility: one named function per read-only resource, so components ask
 * for "the services" instead of assembling URLs.
 * Must not know about: React or rendering.
 */
import type { Faq, Project, ProjectCategory, Service, Stat, Testimonial } from '../types/api.js';
import { get } from './http.js';

/** GET /api/services */
export function getServices(signal?: AbortSignal): Promise<Service[]> {
  return get<Service[]>('/services', { signal });
}

/**
 * GET /api/projects — optionally filtered by category.
 *
 * The filtering happens on the server (project.service.ts), not here: the client
 * asks for a category and renders whatever comes back, including an empty list.
 *
 * @param category - Category slug, or "all"/undefined for the whole portfolio.
 */
export function getProjects(category?: string, signal?: AbortSignal): Promise<Project[]> {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  return get<Project[]>(`/projects${query}`, { signal });
}

/** GET /api/projects/categories — the portfolio filter buttons. */
export function getProjectCategories(signal?: AbortSignal): Promise<ProjectCategory[]> {
  return get<ProjectCategory[]>('/projects/categories', { signal });
}

/** GET /api/testimonials */
export function getTestimonials(signal?: AbortSignal): Promise<Testimonial[]> {
  return get<Testimonial[]>('/testimonials', { signal });
}

/** GET /api/faqs */
export function getFaqs(signal?: AbortSignal): Promise<Faq[]> {
  return get<Faq[]>('/faqs', { signal });
}

/** GET /api/stats */
export function getStats(signal?: AbortSignal): Promise<Stat[]> {
  return get<Stat[]>('/stats', { signal });
}
