import { db } from "@/lib/db";

/**
 * Finds customers who may already be saved under another spelling.
 * The customer list is small, so this loads everyone once and compares in
 * memory: same email, same phone, same Square ID, or a very similar name.
 */

export type DuplicateMatch = { id: string; name: string; reason: string };

type IndexedHousehold = {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  squareCustomerId: string | null;
};

export type HouseholdIndex = IndexedHousehold[];

const digitsOf = (s: string | null | undefined): string => (s ?? "").replace(/\D/g, "").slice(-10);
const normName = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function distance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = tmp;
    }
  }
  return prev[b.length];
}

export async function loadHouseholdIndex(): Promise<HouseholdIndex> {
  const households = await db.household.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      squareCustomerId: true,
      users: { select: { name: true, email: true, phone: true }, orderBy: { createdAt: "asc" } },
    },
  });
  return households.map(
    (h: {
      id: string;
      email: string | null;
      phone: string | null;
      squareCustomerId: string | null;
      users: { name: string; email: string; phone: string | null }[];
    }): IndexedHousehold => ({
      id: h.id,
      name: h.users[0]?.name ?? "(no name)",
      emails: [h.email, ...h.users.map((u) => u.email)].filter((e): e is string => Boolean(e)).map((e) => e.toLowerCase()),
      phones: [h.phone, ...h.users.map((u) => u.phone)].map(digitsOf).filter((p) => p.length >= 7),
      squareCustomerId: h.squareCustomerId,
    })
  );
}

export function matchDuplicates(
  index: HouseholdIndex,
  candidate: { name?: string; email?: string; phone?: string; squareCustomerId?: string },
  excludeId?: string
): DuplicateMatch[] {
  const email = candidate.email?.toLowerCase().trim();
  const phone = digitsOf(candidate.phone);
  const name = candidate.name ? normName(candidate.name) : "";
  const out: DuplicateMatch[] = [];

  for (const h of index) {
    if (h.id === excludeId) continue;
    const reasons: string[] = [];
    if (candidate.squareCustomerId && h.squareCustomerId === candidate.squareCustomerId) reasons.push("same Square profile");
    if (email && h.emails.includes(email)) reasons.push("same email");
    if (phone.length >= 7 && h.phones.includes(phone)) reasons.push("same phone");
    if (name.length >= 5) {
      const other = normName(h.name);
      if (other && (other === name || distance(name, other) <= 2)) reasons.push("similar name");
    }
    if (reasons.length > 0) out.push({ id: h.id, name: h.name, reason: reasons.join(", ") });
  }
  return out;
}
