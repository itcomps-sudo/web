import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { OPEN_TICKET_STATUSES, TICKET_STATUSES, label } from "@/lib/ticket-config";
import { primaryButton } from "@/components/admin/form-ui";

const PRIORITY_STYLE: Record<string, string> = {
  LOW: "text-ink/50",
  NORMAL: "text-ink/80",
  HIGH: "font-semibold text-amber-dark",
  URGENT: "font-semibold text-clay",
};

export default async function AdminTicketsPage({ searchParams }: { searchParams: { status?: string } }) {
  await requireAdminSession();

  // "open" (default) = anything still needing attention, "all", or one exact status.
  const filter = searchParams.status ?? "open";
  let where: Prisma.SupportTicketWhereInput = {};
  if (filter === "open") {
    where = { status: { in: OPEN_TICKET_STATUSES } };
  } else if ((TICKET_STATUSES as string[]).includes(filter)) {
    where = { status: filter as (typeof TICKET_STATUSES)[number] };
  }

  const tickets = await db.supportTicket.findMany({
    where,
    include: {
      device: { select: { name: true } },
      household: { include: { users: { take: 1, orderBy: { createdAt: "asc" } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const tabs: { key: string; text: string }[] = [
    { key: "open", text: "Open" },
    { key: "RESOLVED", text: "Resolved" },
    { key: "CLOSED", text: "Closed" },
    { key: "all", text: "All" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Tickets</h1>
        <Link href="/admin/tickets/new" className={primaryButton}>
          Log ticket
        </Link>
      </div>

      <nav className="mt-6 flex gap-2" aria-label="Ticket filter">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/tickets?status=${t.key}`}
            aria-current={filter === t.key ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 ${
              filter === t.key ? "bg-ink text-paper" : "border border-mist bg-white text-ink hover:bg-mist/40"
            }`}
          >
            {t.text}
          </Link>
        ))}
      </nav>

      <div className="mt-6 overflow-hidden rounded-xl2 border border-mist bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-mist bg-mist/30 text-sm uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Opened</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-ink/60">
                  Nothing here.
                </td>
              </tr>
            )}
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-mist last:border-0 hover:bg-mist/20">
                <td className="px-4 py-3 text-ink/60">{t.ticketNo}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/tickets/${t.id}`} className="font-semibold text-ink hover:underline">
                    {t.subject ?? t.category}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/80">{t.household.users[0]?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink/80">{t.device?.name ?? "—"}</td>
                <td className={`px-4 py-3 ${PRIORITY_STYLE[t.priority]}`}>{label(t.priority)}</td>
                <td className="px-4 py-3 text-ink/80">{label(t.status)}</td>
                <td className="px-4 py-3 text-ink/80">{label(t.source)}</td>
                <td className="px-4 py-3 text-ink/60">{t.createdAt.toLocaleDateString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
