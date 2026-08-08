/**
 * Client-side mirror of the server's domain entities.
 *
 * These types are duplicated rather than imported from `server/src/domain`
 * deliberately: the browser talks to an HTTP API, not to the server's modules,
 * and coupling the bundle to backend source would mean the client could no
 * longer be deployed or type-checked on its own. What crosses the wire is JSON,
 * and this file is its contract.
 *
 * Keys are English; the string values arrive in Spanish because they are the
 * copy shown to visitors.
 */

export type BusinessCategory = 'gastronomia' | 'salud' | 'servicios' | 'retail';

/** One card in the "Servicios" section. */
export interface Service {
  id: string;
  order: number;
  /** Key resolved by the <Icon> component into an inline SVG. */
  icon: string;
  title: string;
  description: string;
}

/** One case study in the "Portfolio" section. */
export interface Project {
  id: string;
  order: number;
  category: BusinessCategory;
  categoryLabel: string;
  initials: string;
  name: string;
  description: string;
  metricValue: string;
  metricLabel: string;
  thumbVariant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
}

/** A filter button of the portfolio, derived server-side from the projects. */
export interface ProjectCategory {
  slug: string;
  label: string;
}

/** One quote in the "Testimonios" section. */
export interface Testimonial {
  id: string;
  order: number;
  initials: string;
  author: string;
  role: string;
  company: string;
  quote: string;
}

/** One entry of the FAQ accordion. */
export interface Faq {
  id: string;
  order: number;
  question: string;
  answer: string;
}

/** One animated counter of the metrics band. */
export interface Stat {
  id: string;
  order: number;
  value: number;
  suffix: string;
  label: string;
}

/** What POST /api/contact returns once the lead is stored. */
export interface ContactReceipt {
  id: string;
  createdAt: string;
}
