/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: store and read contact submissions in `data/leads.json`.
 * Must not know about: HTTP, validation or email delivery.
 *
 * This is the only repository that writes. It generates the id and the timestamp
 * because those belong to persistence, not to the caller: the service layer
 * should not have to invent identifiers to save something.
 */
import { randomUUID } from 'node:crypto';

import type { Lead } from '../../domain/entities.js';
import type { LeadRepository, NewLead } from '../contracts.js';
import { appendToCollection, readCollection } from '../json-store.js';

const FILE = 'leads.json';

export const jsonLeadRepository: LeadRepository = {
  /** Writes land on a real disk that outlives the request. */
  isDurable: true,

  /**
   * Appends a lead to the collection.
   *
   * @param lead - Validated submission data.
   * @returns The stored lead with its generated id and ISO timestamp.
   */
  async create(lead: NewLead): Promise<Lead> {
    const stored: Lead = {
      ...lead,
      id: randomUUID(),
      createdAt: new Date().toISOString()
    };

    // The append is atomic and serialised — see json-store.ts for why.
    await appendToCollection<Lead>(FILE, stored);
    return stored;
  },

  /** Returns every stored lead, newest first. */
  async findAll(): Promise<Lead[]> {
    const leads = await readCollection<Lead>(FILE);
    return [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
};
