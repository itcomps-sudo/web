import Link from "next/link";
import { notFound } from "next/navigation";
import { addTicketMessage, updateTicket } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { formatRustDeskId } from "@/lib/rustdesk";
import { TICKET_PRIORITIES, TICKET_STATUSES, label } from "@/lib/ticket-config";
import CopyButton from "@/components/admin/CopyButton";
import { ErrorBanner, Field, inputClass, primaryButton } from "@/components/admin/form-ui";

export default async function TicketDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  await requireAdminSession();

  const ticket = await db.supportTicket.findUnique({
    where: { id: params.id },
    include: {
      device: true,
      household: { include: { users: { take: 1, orderBy: { createdAt: "asc" } } } },
      messages: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
    },
  });
  if (!ticket) notFound();

  const customer = ticket.household.users[0];
  const device = ticket.device;

  return (
    <div>
      <p className="text-sm text-ink/50">
        <Link href="/admin/tickets" className="hover:underline">
          Tickets
        </Link>{" "}
        / #{ticket.ticketNo}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{ticket.subject ?? ticket.category}</h1>
      <p className="mt-1 text-ink/70">
        <Link href={`/admin/customers/${ticket.householdId}`} className="hover:underline">
          {customer?.name ?? "(no primary user)"}
        </Link>
        {customer?.email ? ` · ${customer.email}` : ""}
        {ticket.household.phone ? ` · ${ticket.household.phone}` : ""}
      </p>

      <ErrorBanner message={searchParams.error} />

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl2 border border-mist bg-white p-6">
          <h2 className="font-semibold text-ink">Details</h2>
          <dl className="mt-3 space-y-1 text-ink/80">
            <div><dt className="inline font-medium">Category: </dt><dd className="inline">{ticket.category}</dd></div>
            <div><dt className="inline font-medium">Came in by: </dt><dd className="inline">{label(ticket.source)}</dd></div>
            <div><dt className="inline font-medium">Opened: </dt><dd className="inline">{ticket.createdAt.toDateString()}</dd></div>
            {ticket.resolvedAt && (
              <div><dt className="inline font-medium">Resolved: </dt><dd className="inline">{ticket.resolvedAt.toDateString()}</dd></div>
            )}
          </dl>
          <p className="mt-4 whitespace-pre-wrap text-ink/90">{ticket.description}</p>

          <form action={updateTicket} className="mt-6 grid gap-4 border-t border-mist pt-5 md:grid-cols-2">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <Field label="Status" htmlFor="status">
              <select id="status" name="status" defaultValue={ticket.status} className={inputClass}>
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority" htmlFor="priority">
              <select id="priority" name="priority" defaultValue={ticket.priority} className={inputClass}>
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {label(p)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="md:col-span-2">
              <button type="submit" className={primaryButton}>
                Update ticket
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl2 border border-mist bg-white p-6">
          <h2 className="font-semibold text-ink">Device</h2>
          {!device ? (
            <p className="mt-2 text-ink/60">Not tied to a specific device.</p>
          ) : (
            <>
              <p className="mt-2 font-semibold text-ink">
                <Link href={`/admin/devices/${device.id}`} className="hover:underline">
                  {device.name}
                </Link>
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div>
                  <p className="text-sm uppercase tracking-wide text-ink/50">RustDesk ID</p>
                  <p className="font-mono text-xl font-semibold text-ink">{formatRustDeskId(device.rustdeskId)}</p>
                </div>
                {device.rustdeskId && <CopyButton value={device.rustdeskId} />}
              </div>

              <dl className="mt-4 space-y-1 text-ink/80">
                <div><dt className="inline font-medium">Make/model: </dt><dd className="inline">{[device.manufacturer, device.model].filter(Boolean).join(" ") || "—"}</dd></div>
                <div><dt className="inline font-medium">OS: </dt><dd className="inline">{[device.os, device.osVersion].filter(Boolean).join(" ") || "—"}</dd></div>
                <div><dt className="inline font-medium">CPU: </dt><dd className="inline">{device.cpu ?? "—"}</dd></div>
                <div><dt className="inline font-medium">RAM / storage: </dt><dd className="inline">{device.ramGb ? `${device.ramGb} GB` : "—"} / {device.storageGb ? `${device.storageGb} GB` : "—"}</dd></div>
                <div><dt className="inline font-medium">Antivirus: </dt><dd className="inline">{device.antivirus ?? "—"}</dd></div>
                <div><dt className="inline font-medium">Backup: </dt><dd className="inline">{device.backupStatus ?? "—"}</dd></div>
              </dl>
              {device.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-ink/70">{device.notes}</p>}
            </>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <h2 className="font-semibold text-ink">Notes and messages</h2>
        {ticket.messages.length === 0 ? (
          <p className="mt-2 text-ink/60">Nothing yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {ticket.messages.map((m) => (
              <li key={m.id} className="border-b border-mist pb-3 last:border-0">
                <p className="whitespace-pre-wrap text-ink/90">{m.content}</p>
                <p className="text-sm text-ink/50">
                  {m.author.name}, {m.createdAt.toLocaleString("en-US")}
                  {m.internal && (
                    <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs font-medium text-ink/70">
                      Internal
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form action={addTicketMessage} className="mt-5 border-t border-mist pt-5">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <Field label="Add a note" htmlFor="content">
            <textarea id="content" name="content" required rows={4} maxLength={4000} className={inputClass} />
          </Field>
          <label className="mt-3 flex items-center gap-2 text-ink/80">
            <input type="checkbox" name="internal" defaultChecked className="h-4 w-4" />
            Internal note (the customer will never see this)
          </label>
          <div className="mt-4">
            <button type="submit" className={primaryButton}>
              Add note
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
