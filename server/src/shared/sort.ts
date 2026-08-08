/**
 * LAYER: Shared utilities
 * Responsibility: reusable comparators.
 *
 * Content order is data, not file order: every entity carries an explicit
 * `order` field so reordering a section is a JSON edit, never a code change.
 */

/** Comparator that sorts any `{ order }` record ascending. */
export function byOrder(a: { order: number }, b: { order: number }): number {
  return a.order - b.order;
}
