import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminCustomersPage() {
  const households = await db.household.findMany({
    include: { plan: true, users: true, devices: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Customers</h1>
      <div className="mt-6 overflow-hidden rounded-xl2 border border-mist bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-mist bg-mist/30 text-sm uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Devices</th>
            </tr>
          </thead>
          <tbody>
            {households.map((h) => (
              <tr key={h.id} className="border-b border-mist last:border-0 hover:bg-mist/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${h.id}`} className="font-semibold text-ink hover:underline">
                    {h.users[0]?.name ?? "(no primary user)"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/80">{h.plan?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink/80">{h.subscriptionStatus}</td>
                <td className="px-4 py-3 text-ink/80">{h.devices.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
