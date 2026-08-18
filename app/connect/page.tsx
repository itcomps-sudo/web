import { Download, PhoneCall, ShieldCheck, Monitor } from "lucide-react";
import { businessConfig } from "@/lib/config/business";

export default function ConnectPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-light">
          <Monitor className="h-7 w-7 text-sage" aria-hidden />
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold text-ink">
          Let&apos;s Get You Connected
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-ink/80">
          Follow the three steps below so we can see your screen and help — you&apos;ll be
          able to watch everything we do, and you can end the session anytime.
        </p>
      </div>

      <div className="mt-12 space-y-5">
        <div className="flex items-start gap-5 rounded-xl2 border border-mist bg-white p-6">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber text-lg font-semibold text-white">
            1
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">Download and open it</h2>
            <p className="mt-1 text-lg text-ink/70">
              It&apos;s called RustDesk, and it&apos;s free. Click the button below — when it
              opens, there&apos;s no setup wizard to click through. It shows you a connect
              code right away.
            </p>
            <a
              href="https://rustdesk.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-lg font-semibold text-white hover:bg-amber-dark"
            >
              <Download className="h-5 w-5" aria-hidden />
              Download the Connection Tool
            </a>
          </div>
        </div>

        <div className="flex items-start gap-5 rounded-xl2 border border-mist bg-white p-6">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber text-lg font-semibold text-white">
            2
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">Call us and read us the code</h2>
            <p className="mt-1 text-lg text-ink/70">
              Call {businessConfig.phone} and tell us the ID and password on your screen.
              We&apos;ll use it to connect right away — you keep the file for next time, too.
            </p>
            <a
              href={`tel:${businessConfig.phone.replace(/[^\d+]/g, "")}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 text-lg font-semibold text-ink hover:bg-ink hover:text-paper"
            >
              <PhoneCall className="h-5 w-5" aria-hidden />
              Call {businessConfig.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-xl2 border-2 border-amber/30 bg-amber/5 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 flex-shrink-0 text-amber-dark" aria-hidden />
          <p className="text-lg text-ink/80">
            <strong>For your safety:</strong> only share this code with someone from{" "}
            {businessConfig.name} during a call you scheduled, or a call you placed to us
            yourself. We will never ask you to install anything or share a code out of the
            blue — if that happens, it&apos;s not us, hang up.
          </p>
        </div>
      </div>
    </div>
  );
}
