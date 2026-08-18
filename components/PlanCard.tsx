import { FeatureList } from "./FeatureList";
import type { PlanConfig } from "@/lib/config/plans";

const accentClasses: Record<PlanConfig["accent"], { bar: string; icon: string; badge: string }> = {
  sage: { bar: "bg-sage", icon: "text-sage", badge: "bg-sage text-white" },
  amber: { bar: "bg-amber", icon: "text-amber-dark", badge: "bg-amber text-white" },
  ink: { bar: "bg-ink", icon: "text-ink", badge: "bg-ink text-paper" },
};

export function PlanCard({ plan }: { plan: PlanConfig }) {
  const accent = accentClasses[plan.accent];

  return (
    <div className="relative overflow-hidden rounded-xl2 border border-mist bg-white">
      <div className={`h-2 w-full ${accent.bar}`} aria-hidden />
      <div className="p-8">
        {plan.isPopular && (
          <span
            className={`absolute right-6 top-6 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${accent.badge}`}
          >
            Most Popular
          </span>
        )}
        <h3 className="font-display text-2xl font-semibold text-ink">{plan.name}</h3>
        <p className="mt-2 text-4xl font-semibold text-ink">
          ${(plan.priceCents / 100).toFixed(2)}
          <span className="text-lg font-normal text-ink/60">/month</span>
        </p>
        <p className="mt-4 text-lg text-ink/80">{plan.description}</p>

        <FeatureList features={plan.features} accentClass={accent.icon} />

        <p className="mt-6 text-sm italic text-ink/60">Perfect for: {plan.perfectFor}</p>

        {/* Phase 2 wires this button to a real Square checkout link */}
        <button
          className="mt-6 w-full rounded-full bg-ink px-6 py-4 text-lg font-semibold text-paper hover:bg-ink/90"
          disabled
          title="Square checkout arrives in Phase 2"
        >
          Choose {plan.name}
        </button>
      </div>
    </div>
  );
}
