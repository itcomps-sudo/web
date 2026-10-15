import { DeviceStatus, TicketPriority, TicketSource, TicketStatus } from "@prisma/client";

export const TICKET_CATEGORIES = [
  "Slow computer",
  "Email or password help",
  "Printer or Wi-Fi",
  "Virus or scam concern",
  "Software or update",
  "New device setup",
  "Other",
] as const;

export const TICKET_STATUSES = Object.values(TicketStatus);
export const TICKET_PRIORITIES = Object.values(TicketPriority);
export const TICKET_SOURCES = Object.values(TicketSource);
export const DEVICE_STATUSES = Object.values(DeviceStatus);

// Tickets that still need attention. Used for the default queue view.
export const OPEN_TICKET_STATUSES: TicketStatus[] = [
  TicketStatus.NEW,
  TicketStatus.OPEN,
  TicketStatus.WAITING_ON_CUSTOMER,
  TicketStatus.SCHEDULED,
];

export const CLOSED_TICKET_STATUSES: TicketStatus[] = [TicketStatus.RESOLVED, TicketStatus.CLOSED];

/** "WAITING_ON_CUSTOMER" -> "Waiting on customer" */
export function label(value: string): string {
  const spaced = value.replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export const DEVICE_STATUS_DOT: Record<string, string> = {
  GREEN: "bg-sage",
  YELLOW: "bg-amber",
  RED: "bg-clay",
  UNKNOWN: "bg-mist",
};
