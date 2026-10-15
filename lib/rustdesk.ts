/**
 * RustDesk IDs are normally 9–10 digits; self-hosted servers can use custom
 * alphanumeric IDs. We strip whitespace (people type "123 456 789") and keep
 * the ID in one canonical form in the database.
 */
export const RUSTDESK_ID_PATTERN = /^[A-Za-z0-9_-]{6,32}$/;

export function normalizeRustDeskId(raw: string): string {
  return raw.replace(/\s+/g, "");
}

/** Display form: 123456789 -> "123 456 789", 1234567890 -> "123 456 7890". */
export function formatRustDeskId(id: string | null | undefined): string {
  if (!id) return "—";
  if (/^\d{9,10}$/.test(id)) return `${id.slice(0, 3)} ${id.slice(3, 6)} ${id.slice(6)}`;
  return id;
}
