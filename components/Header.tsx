import Link from "next/link";
import { businessConfig } from "@/lib/config/business";

export function Header() {
  return (
    <header className="border-b border-mist bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-2xl font-semibold text-ink">
          {businessConfig.name}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/home-computer-care" className="text-lg text-ink hover:text-amber-dark">
            Home Computer Care
          </Link>
          <Link href="/senior-safe-computing" className="text-lg text-ink hover:text-amber-dark">
            Senior Safe Computing
          </Link>
          <Link href="/services" className="text-lg text-ink hover:text-amber-dark">
            Services
          </Link>
          <Link href="/about" className="text-lg text-ink hover:text-amber-dark">
            About
          </Link>
          <Link href="/faq" className="text-lg text-ink hover:text-amber-dark">
            FAQ
          </Link>
          <Link href="/contact" className="text-lg text-ink hover:text-amber-dark">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <a
            href={`tel:${businessConfig.phone.replace(/[^\d+]/g, "")}`}
            className="hidden text-lg font-semibold text-ink md:block"
          >
            {businessConfig.phone}
          </a>
          <Link
            href="/portal"
            className="rounded-full border-2 border-ink px-5 py-2 text-lg font-semibold text-ink hover:bg-ink hover:text-paper"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
