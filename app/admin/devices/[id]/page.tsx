import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { formatRustDeskId } from "@/lib/rustdesk";
import { label } from "@/lib/ticket-config";
import CopyButton from "@/components/admin/CopyButton";
import DeviceForm from "@/components/admin/DeviceForm";
import { primaryButton } from "@/components/admin/form-ui";

export default async function DeviceDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  await requireAdminSession();

  const device = await db.device.findUnique({
    where: { id: params.id },
    include: {
      household: { include: { users: { take: 1, orderBy: { createdAt: "asc" } } } },
      supportTickets: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!device) notFound();

  const customerName = device.household.users[0]?.name ?? "(no primary user)";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">{device.name}</h1>
      <p className="mt-1 text-ink/70">
        <Link href={`/admin/customers/${device.householdId}`} className="hover:underline">
          {customerName}
        </Link>
      </p>

      {device.rustdeskId && (
        <div className="mt-6 flex items-center gap-4 rounded-xl2 border border-mist bg-white p-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-ink/50">RustDesk ID</p>
            <p className="font-mono text-2xl font-semibold text-ink">{formatRustDeskId(device.rustdeskId)}</p>
          </div>
          <CopyButton value={device.rustdeskId} />
        </div>
      )}

      <div className="mt-6">
        <DeviceForm
          householdId={device.householdId}
          customerName={customerName}
          device={device}
          error={searchParams.error}
        />
      </div>

      <section className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Service history</h2>
          <Link href={`/admin/tickets/new?householdId=${device.householdId}`} className={primaryButton}>
            Log ticket
          </Link>
        </div>
        {device.supportTickets.length === 0 ? (
          <p className="mt-2 text-ink/60">No tickets for this device yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {device.supportTickets.map((t) => (
              <li key={t.id} className="border-b border-mist pb-3 last:border-0">
                <Link href={`/admin/tickets/${t.id}`} className="font-medium text-ink hover:underline">
                  #{t.ticketNo} {t.subject ?? t.category}
                </Link>
                <p className="text-sm text-ink/60">
                  {label(t.status)} · {t.createdAt.toDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
