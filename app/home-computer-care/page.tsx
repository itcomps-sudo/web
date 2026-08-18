import Link from "next/link";
import { businessConfig } from "@/lib/config/business";
import { homeCarePlans } from "@/lib/config/plans";
import { PlanCard } from "@/components/PlanCard";
import { WhyChooseUs } from "@/components/WhyChooseUs";

export default function HomeComputerCarePage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold text-ink md:text-5xl">
            {businessConfig.homeComputerCare.tagline}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-ink/80">
            {businessConfig.homeComputerCare.intro}
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {homeCarePlans.map((plan) => (
            <PlanCard key={plan.key} plan={plan} />
          ))}
        </div>

        <div className="mt-16 rounded-xl2 border border-mist bg-white/60 p-8 text-center">
          <p className="text-lg text-ink/80">
            Looking after a parent or an older family member instead? Senior Safe Computing
            is built specifically for that.
          </p>
          <Link
            href="/senior-safe-computing"
            className="mt-3 inline-block text-lg font-semibold text-amber-dark underline underline-offset-4"
          >
            See Senior Safe Computing
          </Link>
        </div>
      </div>

      <WhyChooseUs />
    </>
  );
}
