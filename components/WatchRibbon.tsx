/**
 * The "watch ribbon" — this is the signature visual element for the brand.
 * It encodes the three real signals that define "someone is looking after
 * your computer": Protected, Connected, Checked recently. It appears in the
 * hero and again (with live data) on the customer dashboard, so the same
 * motif that sells the promise is the one that proves it's being kept.
 */
export function WatchRibbon({ compact = false }: { compact?: boolean }) {
  const items = [
    { label: "Protected" },
    { label: "Connected" },
    { label: "Checked recently" },
  ];

  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-4" : "gap-6"}`}>
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sage" aria-hidden />
          <span className={`text-ink/80 ${compact ? "text-sm" : "text-lg"}`}>{item.label}</span>
          {i < items.length - 1 && !compact && (
            <span className="mx-2 h-px w-6 bg-mist" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
