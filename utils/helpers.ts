/**
 * helpers.ts — genuinely reusable utilities.
 * Keep helpers small and focused. If a helper belongs to a specific
 * Page Object, keep it there instead.
 */

/**
 * Returns a timestamp-based unique suffix.
 * Useful for avoiding name conflicts on the shared OrangeHRM demo.
 */
export function uniqueSuffix(): string {
  return Date.now().toString().slice(-6);
}

/**
 * Formats a JS Date to YYYY-MM-DD string (used in date inputs).
 */
export function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
export function today(): string {
  return formatDate(new Date());
}

/**
 * Pauses for a given number of milliseconds.
 * NOTE: Only use this as a last resort — prefer Playwright's
 * built-in automatic waiting via expect() and locators.
 */
export async function pause(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}
