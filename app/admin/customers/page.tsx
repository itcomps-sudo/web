import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import { primaryButton } from "@/components/admin/form-ui";
import { SETUP_STEPS } from "@/lib/setup-checklist";

export default async function AdminCustomersPage() {
  await requireAdminSession();

  const households = await db.household.findMany({
    include: {
      plan: true,
      users: true,
      devices: true,
      onboardingSteps: { where: { stepKey: { startsWith: "setup_" }, completedAt: { not: null } }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Customers</h1>
        <Link href="/admin/customers/new" className={primaryButton}>
          Add customer
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl2 border border-mist bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-mist bg-mist/30 text-sm uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Devices</th>
              <th className="px-4 py-3">Setup</th>
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
                <td className="px-4 py-3 text-ink/80">
                  {h.onboardingSteps.length >= SETUP_STEPS.length ? (
                    <span className="font-medium text-sage">Done</span>
                  ) : (
                    `${h.onboardingSteps.length}/${SETUP_STEPS.length}`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
