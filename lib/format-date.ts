/**
 * Date display helpers.
 *
 * The database stores times in UTC and Vercel's servers run in UTC, so a plain
 * toLocaleString()/toDateString() on the server shows UTC (5 hours ahead of
 * Eastern in winter). Every date shown in the app should go through these.
 */

export const BUSINESS_TIME_ZONE = "America/New_York";

/** e.g. "Nov 4, 2026" */
export function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** e.g. "Nov 4, 2026, 10:13 AM" */
export function formatDateTime(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toLocaleString("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
