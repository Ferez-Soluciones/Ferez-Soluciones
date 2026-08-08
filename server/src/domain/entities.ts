/**
 * LAYER: Domain
 * Responsibility: describe the shapes that travel across every layer of the app.
 * Must not know about: Express, the filesystem, React or any transport detail.
 *
 * These types are the contract the whole backend agrees on. Repositories return
 * them, services transform them and controllers serialise them. Keeping them in
 * one framework-free file is what allows the data source to change (JSON files
 * today, a database tomorrow) without touching anything else.
 *
 * Note on language: keys are English, values are Spanish. The values are the
 * marketing copy of an Argentine business and are rendered verbatim to visitors.
 */

/** Slug used both by the portfolio filter buttons and by the contact form select. */
export type BusinessCategory = 'gastronomia' | 'salud' | 'servicios' | 'retail';

/** Every content entity is ordered explicitly so the UI never depends on file order. */
interface Sortable {
  /** Ascending display order. Lower values are rendered first. */
  order: number;
}

/** One card in the "Servicios" section. */
export interface Service extends Sortable {
  id: string;
  /** Key of the inline SVG rendered by the client's <Icon> component. */
  icon: string;
  title: string;
  description: string;
}

/** One case study in the "Portfolio" section. */
export interface Project extends Sortable {
  id: string;
  category: BusinessCategory;
  /** Human readable version of `category`, shown as the card tag. */
  categoryLabel: string;
  /** Two letters rendered inside the gradient thumbnail (no images on this site). */
  initials: string;
  name: string;
  description: string;
  /** Headline number of the result, e.g. "+41%". */
  metricValue: string;
  /** What the number measures, e.g. "pedidos online en 3 meses". */
  metricLabel: string;
  /** Gradient variant a–f, maps to the `.project__thumb--x` CSS modifier. */
  thumbVariant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
}

/** One quote in the "Testimonios" section. */
export interface Testimonial extends Sortable {
  id: string;
  initials: string;
  author: string;
  /** Job title, e.g. "Dueña". */
  role: string;
  company: string;
  quote: string;
}

/** One entry of the FAQ accordion. */
export interface Faq extends Sortable {
  id: string;
  question: string;
  answer: string;
}

/** One animated counter in the metrics band. */
export interface Stat extends Sortable {
  id: string;
  /** Numeric target the client counts up to. */
  value: number;
  /** Text appended after the number, e.g. "%" or " años". Empty when not needed. */
  suffix: string;
  label: string;
}

/** A contact form submission, once accepted and stored. */
export interface Lead {
  id: string;
  name: string;
  email: string;
  /** Optional business category picked in the form's select. */
  businessType: BusinessCategory | 'otro' | null;
  message: string;
  /** ISO-8601 timestamp of when the lead was stored. */
  createdAt: string;
  /** Where the lead came from. Useful once more than one form exists. */
  source: string;
}
