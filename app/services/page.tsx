import { businessConfig } from "@/lib/config/business";
import { ServiceList } from "@/components/ServiceList";

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-ink">Services</h1>
      <p className="mt-4 text-xl text-ink/80">
        One-time help, business support, and everything in between.
      </p>
      <ServiceList services={businessConfig.services} />
      <p className="mt-10 text-lg text-ink/80">
        Looking for ongoing protection instead of a one-time fix? See{" "}
        <a href="/home-computer-care" className="font-semibold text-amber-dark underline underline-offset-4">
          Home Computer Care
        </a>.
      </p>
    </div>
  );
}
