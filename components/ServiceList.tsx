import {
  Wrench,
  Monitor,
  ShieldCheck,
  Mail,
  Wifi,
  Printer,
  Database,
  Building2,
  MapPin,
  type LucideIcon,
} from "lucide-react";

function iconFor(service: string): LucideIcon {
  const s = service.toLowerCase();
  if (s.includes("repair")) return Wrench;
  if (s.includes("setup")) return Monitor;
  if (s.includes("windows")) return Monitor;
  if (s.includes("365") || s.includes("microsoft")) return Mail;
  if (s.includes("virus") || s.includes("malware")) return ShieldCheck;
  if (s.includes("network")) return Wifi;
  if (s.includes("printer")) return Printer;
  if (s.includes("data migration")) return Database;
  if (s.includes("business")) return Building2;
  if (s.includes("on-site")) return MapPin;
  return Wrench;
}

export function ServiceList({ services }: { services: string[] }) {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const Icon = iconFor(service);
        return (
          <li
            key={service}
            className="flex items-center gap-3 rounded-xl2 border border-mist bg-white px-5 py-4"
          >
            <Icon className="h-5 w-5 flex-shrink-0 text-amber-dark" aria-hidden strokeWidth={2} />
            <span className="text-lg text-ink/90">{service}</span>
          </li>
        );
      })}
    </ul>
  );
}
