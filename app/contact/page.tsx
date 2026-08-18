import { Phone, Mail, Clock } from "lucide-react";
import { businessConfig } from "@/lib/config/business";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-ink">Contact Us</h1>
      <p className="mt-4 text-xl text-ink/80">
        Call, email, or write to us below — a real person will get back to you.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.3fr]">
        <div className="rounded-xl2 bg-ink p-8 text-paper">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber" aria-hidden />
              <div>
                <p className="text-sm uppercase tracking-wide text-paper/60">Phone</p>
                <a href={`tel:${businessConfig.phone.replace(/[^\d+]/g, "")}`} className="text-lg font-semibold">
                  {businessConfig.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber" aria-hidden />
              <div>
                <p className="text-sm uppercase tracking-wide text-paper/60">Email</p>
                <a href={`mailto:${businessConfig.email}`} className="text-lg font-semibold">
                  {businessConfig.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber" aria-hidden />
              <div>
                <p className="text-sm uppercase tracking-wide text-paper/60">Hours</p>
                <p className="text-lg font-semibold">{businessConfig.hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2+: wire this form to create a Lead record and notify the admin */}
        <form className="space-y-5 rounded-xl2 border border-mist bg-white p-8">
          <div>
            <label className="block text-lg font-medium text-ink" htmlFor="name">Name</label>
            <input id="name" name="name" className="mt-2 w-full rounded-lg border border-mist px-4 py-3 text-lg" />
          </div>
          <div>
            <label className="block text-lg font-medium text-ink" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="mt-2 w-full rounded-lg border border-mist px-4 py-3 text-lg" />
          </div>
          <div>
            <label className="block text-lg font-medium text-ink" htmlFor="message">How can we help?</label>
            <textarea id="message" name="message" rows={5} className="mt-2 w-full rounded-lg border border-mist px-4 py-3 text-lg" />
          </div>
          <button type="submit" className="rounded-full bg-amber px-8 py-4 text-lg font-semibold text-white hover:bg-amber-dark">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
