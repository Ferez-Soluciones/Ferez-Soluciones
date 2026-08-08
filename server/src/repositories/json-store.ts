/**
 * LAYER: Repositories (infrastructure)
 * Responsibility: everything delicate about reading and writing JSON files, so
 * that each repository above it can stay a handful of trivial lines.
 * Must not know about: entities, business rules, HTTP.
 *
 * Three problems are solved here, and they are the reason this file exists
 * instead of every repository calling `fs` directly:
 *
 * 1. Repeated reads. Content files never change while the process runs, so they
 *    are parsed once and cached. Without this, every page load would re-read and
 *    re-parse five files.
 * 2. Torn writes. `leads.json` is rewritten in full on each submission. Writing
 *    in place means a crash mid-write leaves a truncated, unparseable file — and
 *    every previous lead is lost with it. We write to a temp file and rename,
 *    which is atomic on the same filesystem.
 * 3. Concurrent writes. Two visitors submitting at the same time would both do
 *    read → push → write and the slower one would overwrite the faster one's
 *    lead. Mutations are therefore queued and run strictly one at a time.
 */
import { randomUUID } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { logger } from '../shared/logger.js';

/**
 * Absolute path of the data directory.
 *
 * Resolved from this module's own location rather than `process.cwd()` so the
 * server works the same whether it is started from the repo root, from
 * `server/`, or from `dist/` after a build.
 */
const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../data');

/** Parsed content files, keyed by filename. Content is immutable at runtime. */
const cache = new Map<string, unknown>();

/**
 * Tail of the write queue. Every mutation chains onto it, which serialises all
 * writes without needing a lock library.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

/** Builds the absolute path of a data file. */
function pathOf(fileName: string): string {
  return resolve(DATA_DIR, fileName);
}

/**
 * Reads and parses a JSON array, caching the result.
 *
 * @param fileName - File name inside `src/data`, e.g. "projects.json".
 * @returns The parsed array. Missing files resolve to an empty array, because a
 *          content file that has not been created yet is a normal state (see
 *          `leads.json`), not an error worth crashing the server over.
 */
export async function readCollection<T>(fileName: string): Promise<T[]> {
  const cached = cache.get(fileName);
  if (cached !== undefined) return cached as T[];

  try {
    const raw = await readFile(pathOf(fileName), 'utf8');
    const parsed = JSON.parse(raw) as T[];
    cache.set(fileName, parsed);
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      cache.set(fileName, []);
      return [];
    }
    logger.error(`Could not read data file "${fileName}".`, error);
    throw error;
  }
}

/**
 * Appends an item to a JSON collection, atomically and one writer at a time.
 *
 * @param fileName - File name inside `src/data`.
 * @param item - The record to append.
 * @returns The appended record (returned unchanged, for call-site convenience).
 */
export async function appendToCollection<T>(fileName: string, item: T): Promise<T> {
  // Chain onto the queue so two simultaneous requests never interleave their
  // read-modify-write cycles. `.catch` keeps one failed write from poisoning
  // every write that comes after it.
  const operation = writeQueue.then(async () => {
    const current = await readCollection<T>(fileName);
    const next = [...current, item];

    const target = pathOf(fileName);
    const temporary = `${target}.${randomUUID()}.tmp`;

    await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    await rename(temporary, target);

    // Keep the cache in sync so the next read does not hit the disk again.
    cache.set(fileName, next);
    return item;
  });

  writeQueue = operation.catch(() => undefined);
  return operation;
}
