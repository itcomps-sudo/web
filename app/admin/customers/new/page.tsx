import Link from "next/link";
import { createCustomer } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { label } from "@/lib/ticket-config";
import {
  getSquareCustomer,
  searchSquareCustomers,
  squareConfigured,
  squareEnvironmentLabel,
  squareErrorMessage,
  type SquareCustomer,
  type SquareSubscriptionSummary,
} from "@/lib/square";
import { ErrorBanner, Field, inputClass, primaryButton, secondaryLink } from "@/components/admin/form-ui";

const STATUS_OPTIONS = ["ACTIVE", "PENDING", "PAUSED", "PAST_DUE", "CANCELED"] as const;

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: { error?: string; q?: string; sq?: string };
}) {
  await requireAdminSession();

  const plans = await db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  const q = (searchParams.q ?? "").trim().slice(0, 100);
  const sq = (searchParams.sq ?? "").trim().slice(0, 100);
  const hasSquare = squareConfigured();

  let squareError: string | undefined;
  let results: SquareCustomer[] = [];
  let picked: { customer: SquareCustomer; subscription: SquareSubscriptionSummary | null } | null = null;

  if (hasSquare) {
    try {
      if (sq) picked = await getSquareCustomer(sq);
      else if (q) results = await searchSquareCustomers(q);
    } catch (err) {
      squareError = squareErrorMessage(err);
    }
  }

  // Square IDs that are already saved here, so we can warn instead of creating a duplicate.
  const idsToCheck = [...results.map((r) => r.id), ...(picked ? [picked.customer.id] : [])].filter(Boolean);
  const existing = idsToCheck.length
    ? await db.household.findMany({
        where: { squareCustomerId: { in: idsToCheck } },
        select: { id: true, squareCustomerId: true },
      })
    : [];
  const existingBySquareId = new Map<string, string>(
    existing.map((h): [string, string] => [String(h.squareCustomerId), String(h.id)])
  );
  const alreadyHere: string | undefined = picked ? existingBySquareId.get(picked.customer.id) : undefined;

  const picked2 = picked as { customer: SquareCustomer; subscription: SquareSubscriptionSummary | null } | null;
  const c = picked2?.customer;
  const sub = picked2?.subscription ?? null;

  // Pre-select the portal plan that matches Square's: by linked variation ID
  // first, then by name ("Senior Safe Computing Plan" -> "Senior Safe Computing").
  const norm = (x: string) => x.toLowerCase().replace(/\b(plan|monthly|annual|yearly)\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const matchedPlan = sub
    ? plans.find((p) => p.squareVariationId && p.squareVariationId === sub.planVariationId) ??
      plans.find((p) => {
        const n = norm(p.name);
        return Boolean(n) && [sub.planName, sub.variationName].some((sn) => sn && (norm(sn).includes(n) || n.includes(norm(sn))));
      })
    : undefined;
  const squarePlanLabel = sub ? sub.planName || sub.variationName : "";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Add customer</h1>
      <p className="mt-2 text-ink/70">
        Set the customer up in Square first, then pull them in here so you don&apos;t type everything twice.
      </p>

      {/* Square lookup: a plain GET form, so the results come back as links. */}
      <section className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <h2 className="font-semibold text-ink">Import from Square</h2>
        {!hasSquare ? (
          <p className="mt-2 text-sm text-ink/60">
            Square isn&apos;t connected on this site yet (no SQUARE_ACCESS_TOKEN). You can still fill in the form below by hand.
          </p>
        ) : (
          <>
            <form method="get" className="mt-3 flex flex-wrap gap-3">
              <input
                name="q"
                defaultValue={q}
                placeholder="Name, email or phone"
                aria-label="Search Square customers"
                maxLength={100}
                className={`${inputClass} !mt-0 max-w-sm`}
              />
              <button type="submit" className={primaryButton}>
                Search Square
              </button>
            </form>
            <p className="mt-2 text-sm text-ink/50">Connected to Square ({squareEnvironmentLabel()}). Nothing is changed in Square.</p>

            {squareError && (
              <p role="alert" className="mt-4 rounded-lg border border-clay bg-clay-light px-4 py-3 text-clay">
                Square said: {squareError}
              </p>
            )}

            {!squareError && q && !sq && results.length === 0 && (
              <p className="mt-4 text-ink/70">
                No Square customers matched &ldquo;{q}&rdquo;. Try their email or phone number instead.
              </p>
            )}

            {results.length > 0 && (
              <ul className="mt-4 divide-y divide-mist rounded-lg border border-mist">
                {results.map((r) => {
                  const hereId = existingBySquareId.get(r.id);
                  return (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <div className="font-semibold text-ink">{r.name}</div>
                        <div className="text-sm text-ink/60">{[r.email, r.phone].filter(Boolean).join(" · ") || "No contact info"}</div>
                      </div>
                      {hereId ? (
                        <Link href={`/admin/customers/${hereId}`} className="text-sm font-medium text-ink underline">
                          Already added: open
                        </Link>
                      ) : (
                        <Link href={`/admin/customers/new?sq=${encodeURIComponent(r.id)}`} className={secondaryLink}>
                          Use this customer
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>

      {picked2 ? (
        <p className="mt-6 rounded-lg border border-sage bg-sage-light px-4 py-3 text-ink">
          Filled in from Square: <strong>{picked2.customer.name}</strong>
          {sub
            ? ` (subscription ${sub.rawStatus.toLowerCase()}${squarePlanLabel ? `, ${squarePlanLabel}` : ""})`
            : " (no subscription found in Square, including duplicate profiles with the same email or phone)"}
          .{" "}
          {sub && sub.billedCustomerId !== picked2.customer.id && (
            <>The subscription is on a different Square profile for this person, so that profile&apos;s ID is filled in below. </>
          )}
          Check the details{sub && !matchedPlan ? ", pick their plan" : ""}, and click Add customer.
        </p>
      ) : null}
      {alreadyHere && (
        <p className="mt-4 rounded-lg border border-clay bg-clay-light px-4 py-3 text-clay">
          This Square customer is already saved here.{" "}
          <Link href={`/admin/customers/${alreadyHere}`} className="font-semibold underline">
            Open them
          </Link>{" "}
          instead of adding a second copy.
        </p>
      )}

      <form
        key={sq || "manual"}
        action={createCustomer}
        className="mt-6 rounded-xl2 border border-mist bg-white p-6"
      >
        <ErrorBanner message={searchParams.error} />

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required maxLength={100} defaultValue={c?.name ?? ""} className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" required maxLength={200} defaultValue={c?.email ?? ""} className={inputClass} />
          </Field>

          <Field label="Phone" htmlFor="phone">
            <input id="phone" name="phone" type="tel" maxLength={30} defaultValue={c?.phone ?? ""} className={inputClass} />
          </Field>
          <Field label="Address (optional)" htmlFor="address">
            <input id="address" name="address" maxLength={200} defaultValue={c?.address ?? ""} className={inputClass} />
          </Field>

          <Field
            label="Plan"
            htmlFor="planId"
            hint={
              plans.length === 0
                ? "No plans are saved in the database yet, so this can stay empty for now."
                : sub && !matchedPlan
                  ? `Couldn't match Square's plan${squarePlanLabel ? ` (${squarePlanLabel})` : ""} to a plan here, so choose this one yourself.`
                  : matchedPlan
                    ? "Matched from the Square subscription."
                    : undefined
            }
          >
            <select id="planId" name="planId" defaultValue={matchedPlan?.id ?? ""} className={inputClass}>
              <option value="">No plan recorded</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={sub?.status ?? "ACTIVE"} className={inputClass}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Square customer ID (optional)" htmlFor="squareCustomerId">
            <input
              id="squareCustomerId"
              name="squareCustomerId"
              maxLength={100}
              defaultValue={sub?.billedCustomerId ?? c?.id ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Square subscription ID (optional)" htmlFor="squareSubscriptionId">
            <input
              id="squareSubscriptionId"
              name="squareSubscriptionId"
              maxLength={100}
              defaultValue={sub?.id ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <p className="mt-5 text-sm text-ink/50">
          The customer can&apos;t sign in to the portal yet; a sign-in or invite flow comes later. Nothing is emailed to them.
        </p>

        <div className="mt-6">
          <button type="submit" className={primaryButton}>
            Add customer
          </button>
        </div>
      </form>
    </div>
  );
}
