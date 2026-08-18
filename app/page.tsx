import Link from "next/link";
import { ShieldCheck, Wrench, HeartHandshake } from "lucide-react";
import { businessConfig } from "@/lib/config/business";
import { WatchRibbon } from "@/components/WatchRibbon";
import { HeroGraphic } from "@/components/HeroGraphic";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <HeroGraphic />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-semibold leading-tight text-ink md:text-6xl">
              {businessConfig.tagline}
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-ink/80">
              {businessConfig.name} has helped families in {businessConfig.address} with
              their computers for over 20 years. Now we offer ongoing protection and
              support, too — so a computer problem never turns into a crisis.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/home-computer-care"
                className="rounded-full bg-amber px-8 py-4 text-lg font-semibold text-white hover:bg-amber-dark"
              >
                See Membership Plans
              </Link>
              <Link
                href="/contact"
                className="rounded-full border-2 border-ink px-8 py-4 text-lg font-semibold text-ink hover:bg-ink hover:text-paper"
              >
                I Need Computer Help
              </Link>
            </div>
            <div className="mt-10">
              <WatchRibbon />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-mist bg-white/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-3xl font-semibold text-ink">
            {businessConfig.homeComputerCare.name}
          </h2>
          <p className="mt-3 max-w-xl text-lg text-ink/80">
            {businessConfig.homeComputerCare.tagline}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl2 border border-mist bg-white p-5">
              <ShieldCheck className="h-6 w-6 text-sage" aria-hidden />
              <p className="mt-3 font-semibold text-ink">Security Monitoring</p>
              <p className="mt-1 text-ink/70">Antivirus and malware protection, kept current.</p>
            </div>
            <div className="rounded-xl2 border border-mist bg-white p-5">
              <Wrench className="h-6 w-6 text-amber-dark" aria-hidden />
              <p className="mt-3 font-semibold text-ink">System Maintenance</p>
              <p className="mt-1 text-ink/70">Health checks and tune-ups, before small issues grow.</p>
            </div>
            <div className="rounded-xl2 border border-mist bg-white p-5">
              <HeartHandshake className="h-6 w-6 text-ink" aria-hidden />
              <p className="mt-3 font-semibold text-ink">Priority Support</p>
              <p className="mt-1 text-ink/70">Member discounts and faster scheduling when you need help.</p>
            </div>
          </div>
          <Link
            href="/home-computer-care"
            className="mt-8 inline-block text-lg font-semibold text-amber-dark underline underline-offset-4"
          >
            Plans starting at $14.99/month
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-xl2 border border-mist bg-white p-8 md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {businessConfig.seniorSafeComputing.name}
            </h2>
            <p className="mt-2 max-w-lg text-lg text-ink/80">
              {businessConfig.seniorSafeComputing.tagline}
            </p>
          </div>
          <Link
            href="/senior-safe-computing"
            className="mt-4 inline-block flex-shrink-0 rounded-full border-2 border-ink px-6 py-3 text-lg font-semibold text-ink hover:bg-ink hover:text-paper md:mt-0"
          >
            Learn More
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-semibold text-ink">
          Traditional IT services
        </h2>
        <p className="mt-3 max-w-xl text-lg text-ink/80">
          Still need a one-time fix, a setup, or business support? We do that too.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {businessConfig.services.map((service) => (
            <li
              key={service}
              className="rounded-xl2 border border-mist bg-white px-4 py-3 text-ink/90"
            >
              {service}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
