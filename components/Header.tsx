import Link from "next/link";
import { Phone } from "lucide-react";
import { businessConfig } from "@/lib/config/business";
import { HeaderNav } from "./HeaderNav";

export function Header() {
  return (
    <header className="relative z-50 border-b border-mist bg-paper">
      {/* Slim contact bar */}
      <div className="hidden border-b border-mist/60 bg-ink text-paper/90 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-sm">
          <span>{businessConfig.hours}</span>
          <a
            href={`tel:${businessConfig.phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-1.5 font-medium hover:text-amber"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {businessConfig.phone}
          </a>
        </div>
      </div>

      {/* Main row */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl font-semibold text-ink">
          {businessConfig.name}
        </Link>

        <HeaderNav />

        <Link
          href="/portal"
          className="hidden rounded-full border-2 border-ink px-5 py-2 text-lg font-semibold text-ink hover:bg-ink hover:text-paper md:block"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}
