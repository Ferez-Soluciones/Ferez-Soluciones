/**
 * LAYER: Repositories (in-memory adapter)
 * Responsibility: satisfy the LeadRepository contract where there is no writable
 * filesystem — that is, on serverless platforms such as Vercel.
 * Must not know about: HTTP, validation or email delivery.
 *
 * Why this exists instead of just letting the JSON adapter fail: on Vercel the
 * filesystem is read-only (and `/tmp` vanishes with the instance), so a write
 * would either throw or, worse, appear to succeed and disappear. Rather than
 * pretend, this adapter declares `isDurable: false`. The contact service reads
 * that flag and refuses to answer "¡Gracias!" unless the notification email
 * actually went out — because in this deployment the email IS the lead.
 *
 * Leads are still kept in memory for the life of the instance. That is not
 * storage anyone should rely on; it only keeps `findAll()` honest and is useful
 * when several submissions hit the same warm instance.
 */
import { randomUUID } from 'node:crypto';

import type { Lead } from '../../domain/entities.js';
import type { LeadRepository, NewLead } from '../contracts.js';

/** Lives as long as the serverless instance does. Intentionally not persisted. */
const leads: Lead[] = [];

export const ephemeralLeadRepository: LeadRepository = {
  /** Nothing written here survives the instance. */
  isDurable: false,

  /**
   * Records a lead in memory.
   *
   * @param lead - Validated submission data.
   * @returns The lead with its generated id and ISO timestamp.
   */
  async create(lead: NewLead): Promise<Lead> {
    const stored: Lead = {
      ...lead,
      id: randomUUID(),
      createdAt: new Date().toISOString()
    };

    leads.push(stored);
    return stored;
  },

  /** Returns the leads this instance happens to have seen, newest first. */
  async findAll(): Promise<Lead[]> {
    return [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
};
