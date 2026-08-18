import { businessConfig } from "@/lib/config/business";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-ink">Contact Us</h1>
      <p className="mt-4 text-xl text-ink/80">
        Call, email, or write to us below — a real person will get back to you.
      </p>
      <div className="mt-8 space-y-2 text-lg text-ink/90">
        <p><strong>Phone:</strong> {businessConfig.phone}</p>
        <p><strong>Email:</strong> {businessConfig.email}</p>
        <p><strong>Hours:</strong> {businessConfig.hours}</p>
      </div>
      {/* Phase 2+: wire this form to create a Lead record and notify the admin */}
      <form className="mt-10 space-y-5">
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
  );
}
