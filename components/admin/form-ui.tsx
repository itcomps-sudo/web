import type { ReactNode } from "react";

// Shared look for the admin forms, matching the existing admin pages.
export const inputClass = "mt-1 w-full rounded-lg border border-mist bg-white px-3 py-2 text-ink";
export const primaryButton =
  "rounded-full bg-ink px-6 py-2.5 font-semibold text-paper hover:bg-ink/90";
export const secondaryLink =
  "inline-block rounded-full border border-mist bg-white px-5 py-2 font-medium text-ink hover:bg-mist/40";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-sm text-ink/50">{hint}</p>}
    </div>
  );
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-6 rounded-lg border border-clay bg-clay-light px-4 py-3 text-clay">
      {message}
    </p>
  );
}
