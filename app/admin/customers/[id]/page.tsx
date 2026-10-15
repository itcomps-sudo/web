import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-guards";
import { formatRustDeskId } from "@/lib/rustdesk";
import { label } from "@/lib/ticket-config";
import CopyButton from "@/components/admin/CopyButton";
import { primaryButton } from "@/components/admin/form-ui";

const ONBOARDING_STEPS = [
  "about_you",
  "who_is_this_for",
  "computer_info",
  "computer_status",
  "connect_computer",
  "initial_health_check",
  "complete",
];

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  await requireAdminSession();

  const household = await db.household.findUnique({
    where: { id: params.id },
    include: {
      plan: true,
      users: true,
      devices: { orderBy: { name: "asc" } },
      supportTickets: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: true } },
      onboardingSteps: true,
    },
  });

  if (!household) notFound();

  const completedSteps = new Set(household.onboardingSteps.map((s) => s.stepKey));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">
        {household.users[0]?.name ?? "Household"}
      </h1>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl2 border border-mist bg-white p-6">
          <h2 className="font-semibold text-ink">Customer</h2>
          <dl className="mt-3 space-y-1 text-ink/80">
            <div><dt className="inline font-medium">Email: </dt><dd className="inline">{household.users[0]?.email}</dd></div>
            <div><dt className="inline font-medium">Phone: </dt><dd className="inline">{household.phone ?? "—"}</dd></div>
            <div><dt className="inline font-medium">Plan: </dt><dd className="inline">{household.plan?.name ?? "—"}</dd></div>
            <div><dt className="inline font-medium">Status: </dt><dd className="inline">{household.subscriptionStatus}</dd></div>
            <div><dt className="inline font-medium">Square Customer ID: </dt><dd className="inline">{household.squareCustomerId ?? "—"}</dd></div>
            <div><dt className="inline font-medium">Square Subscription ID: </dt><dd className="inline">{household.squareSubscriptionId ?? "—"}</dd></div>
            <div><dt className="inline font-medium">Signed up: </dt><dd className="inline">{household.createdAt.toDateString()}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl2 border border-mist bg-white p-6">
          <h2 className="font-semibold text-ink">Onboarding</h2>
          <ul className="mt-3 space-y-2">
            {ONBOARDING_STEPS.map((step) => (
              <li key={step} className="flex items-center gap-2 text-ink/80">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    completedSteps.has(step) ? "bg-sage" : "bg-mist"
                  }`}
                  aria-hidden
                />
                {step.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Devices</h2>
          <Link href={`/admin/devices/new?householdId=${household.id}`} className={primaryButton}>
            Add device
          </Link>
        </div>
        {household.devices.length === 0 ? (
          <p className="mt-2 text-ink/60">No devices registered yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {household.devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 border-b border-mist pb-3 last:border-0">
                <div>
                  <Link href={`/admin/devices/${d.id}`} className="font-medium text-ink hover:underline">
                    {d.name}
                  </Link>
                  <p className="text-sm text-ink/70">
                    {[d.manufacturer, d.model].filter(Boolean).join(" ")}
                    {d.os ? ` · ${[d.os, d.osVersion].filter(Boolean).join(" ")}` : ""} · {label(d.status)}
                  </p>
                </div>
                {d.rustdeskId && (
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-ink/90">{formatRustDeskId(d.rustdeskId)}</span>
                    <CopyButton value={d.rustdeskId} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Support History</h2>
          <Link href={`/admin/tickets/new?householdId=${household.id}`} className={primaryButton}>
            Log ticket
          </Link>
        </div>
        {household.supportTickets.length === 0 ? (
          <p className="mt-2 text-ink/60">No support requests yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {household.supportTickets.map((t) => (
              <li key={t.id} className="border-b border-mist pb-3 last:border-0">
                <Link href={`/admin/tickets/${t.id}`} className="font-medium text-ink hover:underline">
                  #{t.ticketNo} {t.subject ?? t.category} — {label(t.status)} ({label(t.priority)})
                </Link>
                <p className="text-ink/70">{t.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl2 border border-mist bg-white p-6">
        <h2 className="font-semibold text-ink">Internal Notes</h2>
        <p className="mt-1 text-sm text-ink/50">Never visible to the customer.</p>
        {household.notes.length === 0 ? (
          <p className="mt-2 text-ink/60">No notes yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {household.notes.map((n) => (
              <li key={n.id} className="border-b border-mist pb-3 last:border-0">
                <p className="text-ink/80">{n.content}</p>
                <p className="text-sm text-ink/50">— {n.author.name}, {n.createdAt.toDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
