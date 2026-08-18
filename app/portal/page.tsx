import { requireCustomerSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";

const statusCopy: Record<string, { label: string; dot: string }> = {
  GREEN: { label: "Your computer looks good.", dot: "bg-sage" },
  YELLOW: { label: "Your computer needs attention.", dot: "bg-amber" },
  RED: { label: "IT Computer Solutions needs to check your computer.", dot: "bg-clay" },
  UNKNOWN: { label: "We're still getting to know your computer.", dot: "bg-mist" },
};

export default async function PortalDashboard() {
  const session = await requireCustomerSession();
  const householdId = (session.user as any).householdId as string | undefined;

  const household = householdId
    ? await db.household.findUnique({
        where: { id: householdId },
        include: { plan: true, devices: true, users: true },
      })
    : null;

  if (!household) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-ink">Welcome</h1>
        <p className="mt-4 text-lg text-ink/80">
          We couldn&apos;t find an account for you yet. If you just subscribed, this
          usually appears within a few minutes — otherwise, contact us and we&apos;ll help.
        </p>
      </div>
    );
  }

  const primaryUser = household.users[0];
  const device = household.devices[0];
  const status = statusCopy[device?.status ?? "UNKNOWN"];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Welcome, {primaryUser?.name?.split(" ")[0] ?? "there"}
      </h1>

      <section className="mt-8 rounded-xl2 border border-mist bg-white p-6">
        <p className="text-sm uppercase tracking-wide text-ink/50">Your Senior Safe Computing Plan</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink">
          {household.plan?.name ?? "No plan yet"}
        </p>
        <p className="mt-2 text-lg text-ink/80">
          Status: <span className="font-semibold">{household.subscriptionStatus}</span>
        </p>
      </section>

      {device && (
        <section className="mt-6 rounded-xl2 border border-mist bg-white p-6">
          <p className="text-sm uppercase tracking-wide text-ink/50">Your Computer</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">{device.name}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className={`inline-block h-3 w-3 rounded-full ${status.dot}`} aria-hidden />
            <span className="text-lg text-ink/90">{status.label}</span>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl2 border border-mist bg-white p-6 text-center">
        <p className="text-xl font-semibold text-ink">Something isn&apos;t working?</p>
        {/* Phase 3+ wires this to the real support-ticket flow */}
        <button className="mt-4 rounded-full bg-amber px-8 py-4 text-lg font-semibold text-white hover:bg-amber-dark">
          Get Help
        </button>
      </section>
    </div>
  );
}
