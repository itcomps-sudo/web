import Link from "next/link";
import { businessConfig } from "@/lib/config/business";

export function Footer() {
  return (
    <footer className="border-t border-mist bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div>
            <p className="font-display text-xl font-semibold text-ink">{businessConfig.name}</p>
            <p className="mt-2 text-ink/80">
              {businessConfig.phone} &middot; {businessConfig.email}
            </p>
            <p className="text-ink/80">{businessConfig.hours}</p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            <Link href="/senior-safe-computing" className="text-ink/80 hover:text-ink">
              Senior Safe Computing
            </Link>
            <Link href="/services" className="text-ink/80 hover:text-ink">
              Services
            </Link>
            <Link href="/privacy" className="text-ink/80 hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="text-ink/80 hover:text-ink">
              Terms
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-sm text-ink/60">
          &copy; {new Date().getFullYear()} {businessConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
