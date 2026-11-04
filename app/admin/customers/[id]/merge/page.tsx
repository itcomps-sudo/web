import Link from "next/link";
import { notFound } from "next/navigation";
import { mergeCustomers } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { ErrorBanner, Field, inputClass, secondaryLink } from "@/components/admin/form-ui";

export default async function MergeCustomerPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  await requireAdminSession();

  const source = await db.household.findUnique({
    where: { id: params.id },
    include: {
      users: { orderBy: { createdAt: "asc" } },
      plan: true,
      _count: { select: { devices: true, supportTickets: true, notes: true, subscriptions: true } },
    },
  });
  if (!source) notFound();

  const others = await db.household.findMany({
    where: { id: { not: params.id } },
    include: { users: { orderBy: { createdAt: "asc" } }, plan: true },
  });
  const options = others
    .map((h) => ({
      id: h.id,
      text: `${h.users[0]?.name ?? "(no name)"} · ${h.users[0]?.email ?? h.email ?? "no email"} · ${h.plan?.name ?? "no plan"}`,
      name: h.users[0]?.name ?? "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const name = source.users[0]?.name ?? "this customer";
  const counts = source._count;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Merge duplicate: {name}</h1>
      <p className="mt-2 max-w-2xl text-ink/70">
        Use this when the same person is saved twice. Everything on <strong>{name}</strong> moves to the customer you keep,
        then <strong>{name}</strong> is deleted. Details the kept customer is missing (phone, address, plan, Square IDs) are
        filled in from this one. Nothing is changed in Square.
      </p>

      <div className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <h2 className="font-semibold text-ink">What will move</h2>
        <ul className="mt-2 text-ink/80">
          <li>{counts.devices} device(s)</li>
          <li>{counts.supportTickets} ticket(s)</li>
          <li>{counts.notes} note(s)</li>
          <li>{counts.subscriptions} subscription record(s)</li>
        </ul>
      </div>

      <form action={mergeCustomers} className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <input type="hidden" name="sourceId" value={source.id} />
        <ErrorBanner message={searchParams.error} />

        <Field label="Keep this customer" htmlFor="targetId" hint="Pick the correct record, usually the one with the right spelling and the plan.">
          <select id="targetId" name="targetId" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choose a customer
            </option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.text}
              </option>
            ))}
          </select>
        </Field>

        <label className="mt-5 flex items-start gap-3 text-ink">
          <input type="checkbox" name="confirm" className="mt-1 h-5 w-5" />
          <span>I understand {name} will be deleted and this can&apos;t be undone.</span>
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-clay px-6 py-2.5 font-semibold text-white hover:bg-clay/90"
          >
            Merge and delete {name}
          </button>
          <Link href={`/admin/customers/${source.id}`} className={secondaryLink}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
