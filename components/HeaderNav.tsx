"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Phone } from "lucide-react";
import { businessConfig } from "@/lib/config/business";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const membershipLinks = [
  { href: "/home-computer-care", label: "Home Computer Care", blurb: "For any home computer" },
  { href: "/senior-safe-computing", label: "Senior Safe Computing", blurb: "Built for seniors" },
];

export function HeaderNav() {
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMembershipOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMembershipOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-7 md:flex">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMembershipOpen((v) => !v)}
            aria-expanded={membershipOpen}
            className="flex items-center gap-1 text-lg text-ink hover:text-amber-dark"
          >
            Memberships
            <ChevronDown className={`h-4 w-4 transition-transform ${membershipOpen ? "rotate-180" : ""}`} aria-hidden />
          </button>
          {membershipOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl2 border border-mist bg-white shadow-lg">
              {membershipLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMembershipOpen(false)}
                  className="block px-5 py-3 hover:bg-paper"
                >
                  <span className="block font-semibold text-ink">{item.label}</span>
                  <span className="block text-sm text-ink/60">{item.blurb}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-lg text-ink hover:text-amber-dark">
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile toggle */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="h-7 w-7 text-ink" /> : <Menu className="h-7 w-7 text-ink" />}
      </button>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-mist bg-paper px-6 py-4 shadow-lg md:hidden">
          <p className="mb-1 mt-2 text-sm font-semibold uppercase tracking-wide text-ink/50">Memberships</p>
          {membershipLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-lg text-ink"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-3 h-px bg-mist" />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-lg text-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="my-3 h-px bg-mist" />
          <a
            href={`tel:${businessConfig.phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-2 py-2.5 text-lg font-semibold text-ink"
          >
            <Phone className="h-5 w-5" aria-hidden /> {businessConfig.phone}
          </a>
          <Link
            href="/portal"
            onClick={() => setMobileOpen(false)}
            className="mt-3 block rounded-full border-2 border-ink px-5 py-2.5 text-center text-lg font-semibold text-ink"
          >
            Sign In
          </Link>
        </div>
      )}
    </>
  );
}
