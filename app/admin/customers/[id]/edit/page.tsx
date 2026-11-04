import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCustomer } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { label } from "@/lib/ticket-config";
import { ErrorBanner, Field, inputClass, primaryButton, secondaryLink } from "@/components/admin/form-ui";

const STATUS_OPTIONS = ["ACTIVE", "PENDING", "PAUSED", "PAST_DUE", "CANCELED"] as const;

export default async function EditCustomerPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  await requireAdminSession();

  const [household, plans] = await Promise.all([
    db.household.findUnique({
      where: { id: params.id },
      include: { users: { orderBy: { createdAt: "asc" } } },
    }),
    db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!household) notFound();

  const primary = household.users[0];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Edit customer</h1>
      <p className="mt-2 text-ink/70">
        This changes the record here only. Nothing is changed in Square, and nothing is emailed to the customer.
      </p>

      <form action={updateCustomer} className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <input type="hidden" name="id" value={household.id} />
        <ErrorBanner message={searchParams.error} />

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required maxLength={100} defaultValue={primary?.name ?? ""} className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={200}
              defaultValue={primary?.email ?? household.email ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Phone" htmlFor="phone">
            <input id="phone" name="phone" type="tel" maxLength={30} defaultValue={household.phone ?? ""} className={inputClass} />
          </Field>
          <Field label="Address (optional)" htmlFor="address">
            <input id="address" name="address" maxLength={200} defaultValue={household.address ?? ""} className={inputClass} />
          </Field>

          <Field label="Plan" htmlFor="planId">
            <select id="planId" name="planId" defaultValue={household.planId ?? ""} className={inputClass}>
              <option value="">No plan recorded</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={household.subscriptionStatus} className={inputClass}>
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
              defaultValue={household.squareCustomerId ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Square subscription ID (optional)" htmlFor="squareSubscriptionId">
            <input
              id="squareSubscriptionId"
              name="squareSubscriptionId"
              maxLength={100}
              defaultValue={household.squareSubscriptionId ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" className={primaryButton}>
            Save changes
          </button>
          <Link href={`/admin/customers/${household.id}`} className={secondaryLink}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
