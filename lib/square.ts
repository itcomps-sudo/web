import { Client, Environment } from "square";

/**
 * Read-only helpers for looking customers up in Square.
 * Nothing here creates or changes anything in Square.
 */

export type SquareCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type SquareSubscriptionSummary = {
  id: string;
  /** Mapped to the portal's status values. */
  status: "ACTIVE" | "PENDING" | "PAUSED" | "CANCELED";
  rawStatus: string;
};

export function squareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN);
}

export function squareEnvironmentLabel(): string {
  return process.env.SQUARE_ENVIRONMENT?.toLowerCase() === "production" ? "production" : "sandbox";
}

function client(): Client {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not set.");
  return new Client({
    accessToken: token,
    environment: squareEnvironmentLabel() === "production" ? Environment.Production : Environment.Sandbox,
  });
}

/** Turns anything thrown by the Square library into a short, safe message. */
export function squareErrorMessage(err: unknown): string {
  const errors = (err as { errors?: { detail?: string; code?: string }[] })?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map((e) => e.detail || e.code || "Square error").join(" ");
  }
  return err instanceof Error ? err.message : "Could not reach Square.";
}

type RawCustomer = {
  id?: string;
  givenName?: string | null;
  familyName?: string | null;
  companyName?: string | null;
  emailAddress?: string | null;
  phoneNumber?: string | null;
  address?: {
    addressLine1?: string | null;
    addressLine2?: string | null;
    locality?: string | null;
    administrativeDistrictLevel1?: string | null;
    postalCode?: string | null;
  };
};

function toCustomer(c: RawCustomer): SquareCustomer {
  const person = [c.givenName, c.familyName].filter(Boolean).join(" ").trim();
  const a = c.address ?? {};
  const stateZip = [a.administrativeDistrictLevel1, a.postalCode].filter(Boolean).join(" ");
  const address = [a.addressLine1, a.addressLine2, a.locality, stateZip].filter(Boolean).join(", ");
  return {
    id: c.id ?? "",
    name: person || c.companyName || "(no name)",
    email: c.emailAddress ?? "",
    phone: c.phoneNumber ?? "",
    address,
  };
}

/**
 * Finds customers by email, phone or name.
 * Square can only search by email or phone, so a name search reads the
 * customer list (up to 500 customers) and filters it here.
 */
export async function searchSquareCustomers(query: string): Promise<SquareCustomer[]> {
  const q = query.trim();
  if (!q) return [];
  const api = client().customersApi;

  if (q.includes("@")) {
    const { result } = await api.searchCustomers({
      limit: BigInt(25),
      query: { filter: { emailAddress: { fuzzy: q } } },
    });
    return (result.customers ?? []).map(toCustomer);
  }

  const digits = q.replace(/\D/g, "");
  if (digits.length >= 7) {
    const { result } = await api.searchCustomers({
      limit: BigInt(25),
      query: { filter: { phoneNumber: { fuzzy: digits } } },
    });
    return (result.customers ?? []).map(toCustomer);
  }

  const needle = q.toLowerCase();
  const matches: SquareCustomer[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 5; page++) {
    // searchCustomers with no filter pages through everyone (a POST body, unlike listCustomers).
    const { result } = await api.searchCustomers({ limit: BigInt(100), ...(cursor ? { cursor } : {}) });
    for (const raw of result.customers ?? []) {
      const c = toCustomer(raw);
      if (c.name.toLowerCase().includes(needle) || c.email.toLowerCase().includes(needle)) matches.push(c);
    }
    cursor = result.cursor;
    if (!cursor) break;
  }
  return matches.slice(0, 25);
}

const STATUS_MAP: Record<string, SquareSubscriptionSummary["status"]> = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  PAUSED: "PAUSED",
  CANCELED: "CANCELED",
  DEACTIVATED: "CANCELED",
};

/** One customer plus their most relevant subscription (an active one if there is one). */
export async function getSquareCustomer(
  customerId: string
): Promise<{ customer: SquareCustomer; subscription: SquareSubscriptionSummary | null }> {
  const sq = client();
  const { result } = await sq.customersApi.retrieveCustomer(customerId);
  if (!result.customer) throw new Error("Square did not return that customer.");

  const subs = await sq.subscriptionsApi.searchSubscriptions({
    query: { filter: { customerIds: [customerId] } },
  });
  const list = subs.result.subscriptions ?? [];
  const best = list.find((s) => s.status === "ACTIVE") ?? list.find((s) => s.status === "PENDING") ?? list[0];

  return {
    customer: toCustomer(result.customer),
    subscription:
      best && best.id
        ? {
            id: best.id,
            rawStatus: best.status ?? "",
            status: STATUS_MAP[best.status ?? ""] ?? "PENDING",
          }
        : null,
  };
}
