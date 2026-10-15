import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { formatRustDeskId } from "@/lib/rustdesk";
import { DEVICE_STATUS_DOT, label } from "@/lib/ticket-config";
import { inputClass, primaryButton } from "@/components/admin/form-ui";

export default async function AdminDevicesPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireAdminSession();

  const q = (searchParams.q ?? "").trim().slice(0, 100);
  const qNoSpaces = q.replace(/\s+/g, "");

  const devices = await db.device.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { manufacturer: { contains: q, mode: "insensitive" } },
            { model: { contains: q, mode: "insensitive" } },
            { rustdeskId: { contains: qNoSpaces } },
            {
              household: {
                users: {
                  some: {
                    OR: [
                      { name: { contains: q, mode: "insensitive" } },
                      { email: { contains: q, mode: "insensitive" } },
                    ],
                  },
                },
              },
            },
          ],
        }
      : undefined,
    include: {
      household: {
        include: { users: { take: 1, orderBy: { createdAt: "asc" } } },
      },
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Devices</h1>
        <Link href="/admin/devices/new" className={primaryButton}>
          Add device
        </Link>
      </div>

      <form method="get" className="mt-6 flex gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by customer, device, or RustDesk ID"
          aria-label="Search devices"
          className={inputClass}
        />
        <button type="submit" className={primaryButton}>
          Search
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl2 border border-mist bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-mist bg-mist/30 text-sm uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">RustDesk ID</th>
              <th className="px-4 py-3">OS</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-ink/60">
                  {q ? "No devices match that search." : "No devices yet."}
                </td>
              </tr>
            )}
            {devices.map((d) => (
              <tr key={d.id} className="border-b border-mist last:border-0 hover:bg-mist/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${d.householdId}`} className="text-ink hover:underline">
                    {d.household.users[0]?.name ?? "(no primary user)"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/devices/${d.id}`} className="font-semibold text-ink hover:underline">
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-ink/80">{formatRustDeskId(d.rustdeskId)}</td>
                <td className="px-4 py-3 text-ink/80">{[d.os, d.osVersion].filter(Boolean).join(" ") || "—"}</td>
                <td className="px-4 py-3 text-ink/80">
                  <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${DEVICE_STATUS_DOT[d.status]}`} aria-hidden />
                  {label(d.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
