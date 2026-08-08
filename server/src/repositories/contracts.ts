/**
 * LAYER: Repositories (contracts)
 * Responsibility: declare what the service layer needs from persistence, without
 * saying anything about how it is stored.
 *
 * This file is the seam of the whole architecture. Services depend on these
 * interfaces, never on a concrete implementation, so replacing the JSON adapter
 * with SQLite, Postgres or an external CMS means writing a new class that
 * satisfies these signatures — and changing nothing else in the codebase.
 *
 * Note that the read methods are async even though the JSON adapter resolves
 * immediately: making them synchronous now would leak "the data is local files"
 * into every caller and force a rewrite the day it stops being true.
 */
import type { Faq, Lead, Project, Service, Stat, Testimonial } from '../domain/entities.js';

/** Shared shape for the read-only content collections. */
export interface ReadOnlyRepository<T> {
  /** Returns every record, already sorted by its `order` field. */
  findAll(): Promise<T[]>;
}

export type ServiceRepository = ReadOnlyRepository<Service>;
export type TestimonialRepository = ReadOnlyRepository<Testimonial>;
export type FaqRepository = ReadOnlyRepository<Faq>;
export type StatRepository = ReadOnlyRepository<Stat>;

export interface ProjectRepository extends ReadOnlyRepository<Project> {
  /**
   * Returns the projects of a single category.
   *
   * It lives in the repository (and not only in the service) because a real
   * database would push this filter down to the query instead of loading every
   * row. The JSON adapter cannot, but the contract already allows it to.
   *
   * @param category - Category slug to match exactly.
   */
  findByCategory(category: string): Promise<Project[]>;
}

/** Data needed to store a lead. `id` and `createdAt` are assigned by the repository. */
export type NewLead = Omit<Lead, 'id' | 'createdAt'>;

export interface LeadRepository {
  /**
   * Whether a stored lead survives the process that stored it.
   *
   * False on serverless platforms, where the filesystem is read-only and `/tmp`
   * disappears with the instance. The contact service reads this to decide how
   * seriously to treat a failed notification email: when storage is durable a
   * lost email is an annoyance, when it is not, the email is the only copy of
   * the lead and failing to send it has to fail the request.
   */
  readonly isDurable: boolean;

  /**
   * Persists a contact submission.
   *
   * @param lead - Validated submission data.
   * @returns The stored lead, including the generated id and timestamp.
   */
  create(lead: NewLead): Promise<Lead>;

  /** Returns every stored lead, newest first. Not exposed over HTTP today. */
  findAll(): Promise<Lead[]>;
}

/** Every repository the application uses, resolved once by the factory. */
export interface Repositories {
  services: ServiceRepository;
  projects: ProjectRepository;
  testimonials: TestimonialRepository;
  faqs: FaqRepository;
  stats: StatRepository;
  leads: LeadRepository;
}
