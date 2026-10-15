"use client";

import { useState } from "react";

/** Small "Copy" button, used for RustDesk IDs. */
export default function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (e.g. non-HTTPS); the ID is still on screen to select by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-mist bg-white px-3 py-1 text-sm font-medium text-ink hover:bg-mist/40"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
