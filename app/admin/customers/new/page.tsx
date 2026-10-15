import { createCustomer } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { label } from "@/lib/ticket-config";
import { ErrorBanner, Field, inputClass, primaryButton } from "@/components/admin/form-ui";

const STATUS_OPTIONS = ["ACTIVE", "PENDING", "PAUSED", "PAST_DUE", "CANCELED"] as const;

export default async function NewCustomerPage({ searchParams }: { searchParams: { error?: string } }) {
  await requireAdminSession();

  const plans = await db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Add customer</h1>
      <p className="mt-2 text-ink/70">
        Use this after you set someone up in Square. It records them here so you can track their devices and tickets.
      </p>

      <form action={createCustomer} className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <ErrorBanner message={searchParams.error} />

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required maxLength={100} className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" required maxLength={200} className={inputClass} />
          </Field>

          <Field label="Phone" htmlFor="phone">
            <input id="phone" name="phone" type="tel" maxLength={30} className={inputClass} />
          </Field>
          <Field label="Address (optional)" htmlFor="address">
            <input id="address" name="address" maxLength={200} className={inputClass} />
          </Field>

          <Field
            label="Plan"
            htmlFor="planId"
            hint={plans.length === 0 ? "No plans are saved in the database yet, so this can stay empty for now." : undefined}
          >
            <select id="planId" name="planId" defaultValue="" className={inputClass}>
              <option value="">No plan recorded</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue="ACTIVE" className={inputClass}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Square customer ID (optional)" htmlFor="squareCustomerId">
            <input id="squareCustomerId" name="squareCustomerId" maxLength={100} className={inputClass} />
          </Field>
          <Field label="Square subscription ID (optional)" htmlFor="squareSubscriptionId">
            <input id="squareSubscriptionId" name="squareSubscriptionId" maxLength={100} className={inputClass} />
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
