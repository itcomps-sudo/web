import { db } from "@/lib/db";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl2 border border-mist bg-white p-6">
      <p className="text-sm uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [
    totalHouseholds,
    activeSubscriptions,
    homeCareCount,
    seniorSafeCount,
    totalDevices,
    devicesByStatus,
    openTickets,
    highPriorityTickets,
    activePlans,
  ] = await Promise.all([
    db.household.count(),
    db.household.count({ where: { subscriptionStatus: "ACTIVE" } }),
    db.household.count({ where: { subscriptionStatus: "ACTIVE", planId: { in: ["basic", "premium", "complete"] } } }),
    db.household.count({ where: { subscriptionStatus: "ACTIVE", planId: "senior-safe" } }),
    db.device.count(),
    db.device.groupBy({ by: ["status"], _count: true }),
    db.supportTicket.count({ where: { status: { in: ["NEW", "OPEN"] } } }),
    db.supportTicket.count({ where: { priority: "HIGH", status: { in: ["NEW", "OPEN"] } } }),
    db.plan.findMany({ where: { isActive: true } }),
  ]);

  const mrrCents = activePlans.reduce((sum, plan) => {
    // Rough MRR: only correct once real per-household plan assignment matches
    // subscription state one-to-one, which is true from Phase 2 onward.
    return sum;
  }, 0);

  const deviceStatusMap: Record<string, number> = {};
  devicesByStatus.forEach((row: any) => (deviceStatusMap[row.status] = row._count));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Overview</h1>

      <h2 className="mt-8 text-lg font-semibold text-ink/70">Memberships</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Households" value={totalHouseholds} />
        <StatCard label="Active Subscriptions" value={activeSubscriptions} />
        <StatCard label="Home Computer Care" value={homeCareCount} />
        <StatCard label="Senior Safe Computing" value={seniorSafeCount} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-ink/70">Devices</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Devices" value={totalDevices} />
        <StatCard label="Healthy" value={deviceStatusMap.GREEN ?? 0} />
        <StatCard label="Needs Attention" value={deviceStatusMap.YELLOW ?? 0} />
        <StatCard label="Needs Check" value={deviceStatusMap.RED ?? 0} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-ink/70">Support</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Open Requests" value={openTickets} />
        <StatCard label="High Priority" value={highPriorityTickets} />
      </div>

      <p className="mt-10 text-sm text-ink/50">
        Revenue figures will be sourced from Square once Phase 2 (billing integration) lands —
        showing subscription counts only for now to avoid displaying incorrect numbers.
      </p>
    </div>
  );
}
