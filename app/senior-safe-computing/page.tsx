import Link from "next/link";
import { businessConfig } from "@/lib/config/business";
import { seniorSafePlan } from "@/lib/config/plans";
import { PlanCard } from "@/components/PlanCard";

export default function SeniorSafeComputingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-ink md:text-5xl">
          Your computer shouldn&apos;t be something you have to worry about.
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-ink/80">
          {businessConfig.seniorSafeComputing.intro}
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-start">
        <div className="max-w-md">
          <PlanCard plan={seniorSafePlan} />
        </div>

        <blockquote className="rounded-xl2 border-2 border-amber/30 bg-amber/5 p-8">
          <p className="font-display text-2xl leading-snug text-ink">
            &ldquo;{businessConfig.seniorSafeComputing.tagline}&rdquo;
          </p>
          <p className="mt-4 text-lg text-ink/80">
            Whether it&apos;s a suspicious email, a printer issue, or a computer problem,
            we&apos;ll help keep your technology safe and running smoothly — with a real
            person to call, not just an app.
          </p>
        </blockquote>
      </div>

      <div className="mt-16 rounded-xl2 border border-mist bg-white/60 p-8 text-center">
        <p className="text-xl text-ink">Not sure which plan is right for you or a family member?</p>
        <p className="mt-3 text-lg text-ink/70">
          Our AI assistant arrives in a later phase — for now, call or write to us and a
          real person will help.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-block rounded-full border-2 border-ink px-6 py-3 text-lg font-semibold text-ink hover:bg-ink hover:text-paper"
        >
          Ask {businessConfig.name}
        </Link>
      </div>
    </div>
  );
}
