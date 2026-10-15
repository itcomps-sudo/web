import { notFound } from "next/navigation";
import { logTicket } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_SOURCES, TICKET_STATUSES, label } from "@/lib/ticket-config";
import CustomerPicker from "@/components/admin/CustomerPicker";
import { ErrorBanner, Field, inputClass, primaryButton } from "@/components/admin/form-ui";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: { householdId?: string; error?: string };
}) {
  await requireAdminSession();

  if (!searchParams.householdId) {
    const households = await db.household.findMany({
      include: { users: { take: 1, orderBy: { createdAt: "asc" } }, plan: true },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Log ticket</h1>
        <p className="mt-2 text-ink/70">Who is this for? Use this for phone calls, texts, emails and walk-ins.</p>
        <CustomerPicker basePath="/admin/tickets/new" households={households} />
      </div>
    );
  }

  const household = await db.household.findUnique({
    where: { id: searchParams.householdId },
    include: {
      users: { take: 1, orderBy: { createdAt: "asc" } },
      devices: { orderBy: { name: "asc" } },
    },
  });
  if (!household) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Log ticket</h1>

      <form action={logTicket} className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <ErrorBanner message={searchParams.error} />
        <input type="hidden" name="householdId" value={household.id} />

        <p className="mb-5 text-ink/70">
          Customer: <span className="font-semibold text-ink">{household.users[0]?.name ?? "(no primary user)"}</span>
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Device" htmlFor="deviceId">
            <select id="deviceId" name="deviceId" defaultValue="" className={inputClass}>
              <option value="">Not device-specific</option>
              {household.devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="How did it come in?" htmlFor="source">
            <select id="source" name="source" defaultValue="PHONE" className={inputClass}>
              {TICKET_SOURCES.filter((s) => s !== "PORTAL").map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category" htmlFor="category">
            <select id="category" name="category" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Choose one…
              </option>
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subject (optional)" htmlFor="subject" hint="A short headline, like Won't print.">
            <input id="subject" name="subject" maxLength={150} className={inputClass} />
          </Field>

          <Field label="Priority" htmlFor="priority">
            <select id="priority" name="priority" defaultValue="NORMAL" className={inputClass}>
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {label(p)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue="OPEN" className={inputClass}>
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5">
          <Field label="What's going on?" htmlFor="description">
            <textarea id="description" name="description" required rows={6} maxLength={4000} className={inputClass} />
          </Field>
        </div>

        <div className="mt-6">
          <button type="submit" className={primaryButton}>
            Log ticket
          </button>
        </div>
      </form>
    </div>
  );
}
