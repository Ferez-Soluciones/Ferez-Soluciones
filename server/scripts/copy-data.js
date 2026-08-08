/**
 * Build helper: copy the JSON content files into `dist/`.
 *
 * `tsc` only emits JavaScript, so the `src/data/*.json` files that the repository
 * layer reads at runtime would be missing from the production bundle. This script
 * mirrors them into `dist/data/` so the compiled server resolves the exact same
 * relative path it uses in development.
 *
 * The list is explicit rather than a directory copy on purpose: `leads.json` also
 * lives in that folder and is runtime state, not content. Copying it would bake
 * whatever leads a developer submitted locally into the production bundle, and
 * then overwrite the real ones on the next deploy.
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Content collections read by the repositories. Runtime files are excluded. */
const CONTENT_FILES = [
  'services.json',
  'projects.json',
  'testimonials.json',
  'faqs.json',
  'stats.json'
];

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(packageRoot, 'src/data');
const target = resolve(packageRoot, 'dist/data');

await mkdir(target, { recursive: true });

for (const file of CONTENT_FILES) {
  await copyFile(join(source, file), join(target, file));
}

console.log(`[build] copied ${CONTENT_FILES.length} content files to ${target}`);
