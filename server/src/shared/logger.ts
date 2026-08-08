/**
 * LAYER: Shared utilities
 * Responsibility: give every layer one consistent way to write to stdout/stderr.
 *
 * A landing page does not need a logging library: structured logs, transports and
 * log shipping would be infrastructure with no consumer. What it does need is a
 * single choke point, so that swapping in pino later means editing this file only.
 */

/** Timestamp prefix shared by every log line, e.g. "14:32:07". */
function timestamp(): string {
  return new Date().toISOString().slice(11, 19);
}

export const logger = {
  info(message: string, ...details: unknown[]): void {
    console.log(`[${timestamp()}] ${message}`, ...details);
  },

  warn(message: string, ...details: unknown[]): void {
    console.warn(`[${timestamp()}] WARN  ${message}`, ...details);
  },

  error(message: string, ...details: unknown[]): void {
    console.error(`[${timestamp()}] ERROR ${message}`, ...details);
  }
};
