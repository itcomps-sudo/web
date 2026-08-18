import { businessConfig } from "@/lib/config/business";

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-ink">Services</h1>
      <p className="mt-4 text-xl text-ink/80">
        One-time help, business support, and everything in between.
      </p>
      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {businessConfig.services.map((service) => (
          <li key={service} className="rounded-xl2 border border-mist bg-white px-5 py-4 text-lg text-ink/90">
            {service}
          </li>
        ))}
      </ul>
      <p className="mt-10 text-lg text-ink/80">
        Looking for ongoing protection instead of a one-time fix? See{" "}
        <a href="/senior-safe-computing" className="font-semibold text-amber-dark underline underline-offset-4">
          Senior Safe Computing
        </a>.
      </p>
    </div>
  );
}
