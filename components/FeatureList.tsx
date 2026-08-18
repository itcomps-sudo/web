import {
  ShieldCheck,
  Monitor,
  Wrench,
  Percent,
  Mail,
  Printer,
  PhoneCall,
  CloudUpload,
  TriangleAlert,
  Users,
  RefreshCw,
  CalendarCheck,
  Circle,
  type LucideIcon,
} from "lucide-react";

/**
 * Feature copy comes from lib/config/plans.ts as plain strings (so it stays
 * editable without touching component code). This maps each feature to a
 * representative icon by keyword, falling back to a plain dot. It's a
 * best-effort visual aid, not a source of truth — the text itself is what's
 * authoritative.
 */
function iconFor(feature: string): LucideIcon {
  const f = feature.toLowerCase();
  if (f.includes("scam") || f.includes("phishing") || f.includes("ransomware")) return TriangleAlert;
  if (f.includes("backup") || f.includes("cloud")) return CloudUpload;
  if (f.includes("email")) return Mail;
  if (f.includes("printer")) return Printer;
  if (f.includes("discount") || f.includes("%")) return Percent;
  if (f.includes("update")) return RefreshCw;
  if (f.includes("tune-up") || f.includes("optimization") || f.includes("health check")) return Wrench;
  if (f.includes("quarterly") || f.includes("checkup") || f.includes("scheduling")) return CalendarCheck;
  if (f.includes("monitor")) return Monitor;
  if (f.includes("family") || f.includes("device coverage")) return Users;
  if (f.includes("support") || f.includes("help") || f.includes("priority")) return PhoneCall;
  if (f.includes("protection") || f.includes("security") || f.includes("antivirus") || f.includes("malware")) {
    return ShieldCheck;
  }
  return Circle;
}

export function FeatureList({ features, accentClass }: { features: string[]; accentClass: string }) {
  return (
    <ul className="mt-6 space-y-3">
      {features.map((feature) => {
        const Icon = iconFor(feature);
        return (
          <li key={feature} className="flex items-start gap-3 text-ink/90">
            <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${accentClass}`} aria-hidden strokeWidth={2} />
            <span>{feature}</span>
          </li>
        );
      })}
    </ul>
  );
}
