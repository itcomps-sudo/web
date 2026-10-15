"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { DeviceStatus, SubscriptionStatus, TicketPriority, TicketSource, TicketStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminActor } from "@/lib/admin-actor";
import { normalizeRustDeskId, RUSTDESK_ID_PATTERN } from "@/lib/rustdesk";
import { CLOSED_TICKET_STATUSES, TICKET_CATEGORIES } from "@/lib/ticket-config";

/**
 * Every action here starts with requireAdminActor() — server actions are
 * public endpoints, so they must not rely on the admin layout's check.
 *
 * Validation failures redirect back to the form with ?error=..., which the
 * pages render as plain text.
 */

// ---------- helpers ----------

function text(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

function numberOrUndefined(fd: FormData, key: string): number | undefined {
  const t = text(fd, key);
  return t === undefined ? undefined : Number(t);
}

function withError(path: string, message: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}error=${encodeURIComponent(message)}`);
}

function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Please check the form and try again.";
}

const optionalText = (max: number) => z.string().max(max, `Keep that field under ${max} characters.`).optional();

// ---------- devices ----------

const deviceSchema = z.object({
  householdId: z.string().min(1, "Choose a customer first."),
  name: z.string().min(1, "Give the device a nickname, like Mom's Dell.").max(100),
  manufacturer: optionalText(100),
  model: optionalText(100),
  serialNumber: optionalText(100),
  os: optionalText(100),
  osVersion: optionalText(100),
  cpu: optionalText(100),
  ramGb: z.number({ invalid_type_error: "RAM must be a number." }).int().min(1).max(4096).optional(),
  storageGb: z.number({ invalid_type_error: "Storage must be a number." }).int().min(1).max(100000).optional(),
  antivirus: optionalText(100),
  backupStatus: optionalText(200),
  warrantyEndsAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker for the warranty date.")
    .optional(),
  rustdeskId: z
    .string()
    .regex(RUSTDESK_ID_PATTERN, "That RustDesk ID doesn't look right. It's usually 9 or 10 digits.")
    .optional(),
  status: z.nativeEnum(DeviceStatus),
  notes: optionalText(4000),
});

export async function saveDevice(formData: FormData): Promise<void> {
  const { userId } = await requireAdminActor();

  const id = text(formData, "id");
  const householdId = text(formData, "householdId") ?? "";
  const back = id
    ? `/admin/devices/${encodeURIComponent(id)}`
    : `/admin/devices/new?householdId=${encodeURIComponent(householdId)}`;

  const rustdeskRaw = text(formData, "rustdeskId");

  const parsed = deviceSchema.safeParse({
    householdId,
    name: text(formData, "name") ?? "",
    manufacturer: text(formData, "manufacturer"),
    model: text(formData, "model"),
    serialNumber: text(formData, "serialNumber"),
    os: text(formData, "os"),
    osVersion: text(formData, "osVersion"),
    cpu: text(formData, "cpu"),
    ramGb: numberOrUndefined(formData, "ramGb"),
    storageGb: numberOrUndefined(formData, "storageGb"),
    antivirus: text(formData, "antivirus"),
    backupStatus: text(formData, "backupStatus"),
    warrantyEndsAt: text(formData, "warrantyEndsAt"),
    rustdeskId: rustdeskRaw ? normalizeRustDeskId(rustdeskRaw) : undefined,
    status: text(formData, "status") ?? "UNKNOWN",
    notes: text(formData, "notes"),
  });
  if (!parsed.success) withError(back, firstError(parsed.error));
  const d = parsed.data;

  const household = await db.household.findUnique({ where: { id: d.householdId }, select: { id: true } });
  if (!household) withError(back, "That customer no longer exists.");

  if (d.rustdeskId) {
    const clash = await db.device.findFirst({
      where: { rustdeskId: d.rustdeskId, ...(id ? { NOT: { id } } : {}) },
      select: { name: true },
    });
    if (clash) withError(back, `That RustDesk ID is already saved on "${clash.name}".`);
  }

  const fields = {
    name: d.name,
    manufacturer: d.manufacturer ?? null,
    model: d.model ?? null,
    serialNumber: d.serialNumber ?? null,
    os: d.os ?? null,
    osVersion: d.osVersion ?? null,
    cpu: d.cpu ?? null,
    ramGb: d.ramGb ?? null,
    storageGb: d.storageGb ?? null,
    antivirus: d.antivirus ?? null,
    backupStatus: d.backupStatus ?? null,
    warrantyEndsAt: d.warrantyEndsAt ? new Date(`${d.warrantyEndsAt}T12:00:00.000Z`) : null,
    rustdeskId: d.rustdeskId ?? null,
    status: d.status,
    notes: d.notes ?? null,
  };

  let deviceId: string;
  if (id) {
    const existing = await db.device.findUnique({ where: { id }, select: { id: true } });
    if (!existing) redirect("/admin/devices");
    // householdId is intentionally not editable here.
    await db.device.update({ where: { id }, data: fields });
    deviceId = id;
  } else {
    const created = await db.device.create({ data: { ...fields, householdId: d.householdId } });
    deviceId = created.id;
  }

  await db.auditLog.create({
    data: {
      actorUserId: userId,
      action: id ? "device_updated" : "device_created",
      targetType: "Device",
      targetId: deviceId,
      metadata: { householdId: d.householdId },
    },
  });

  revalidatePath("/admin/devices");
  revalidatePath(`/admin/customers/${d.householdId}`);
  redirect(`/admin/customers/${d.householdId}`);
}

// ---------- tickets ----------

const ticketSchema = z.object({
  householdId: z.string().min(1, "Choose a customer first."),
  deviceId: z.string().optional(),
  category: z.enum(TICKET_CATEGORIES, { errorMap: () => ({ message: "Pick a category." }) }),
  subject: optionalText(150),
  description: z.string().min(1, "Describe the problem.").max(4000, "Keep the description under 4000 characters."),
  priority: z.nativeEnum(TicketPriority),
  source: z.nativeEnum(TicketSource),
  status: z.nativeEnum(TicketStatus),
});

export async function logTicket(formData: FormData): Promise<void> {
  const { userId } = await requireAdminActor();

  const householdId = text(formData, "householdId") ?? "";
  const back = `/admin/tickets/new?householdId=${encodeURIComponent(householdId)}`;

  const parsed = ticketSchema.safeParse({
    householdId,
    deviceId: text(formData, "deviceId"),
    category: text(formData, "category"),
    subject: text(formData, "subject"),
    description: text(formData, "description") ?? "",
    priority: text(formData, "priority") ?? "NORMAL",
    source: text(formData, "source") ?? "MANUAL",
    status: text(formData, "status") ?? "OPEN",
  });
  if (!parsed.success) withError(back, firstError(parsed.error));
  const t = parsed.data;

  const household = await db.household.findUnique({ where: { id: t.householdId }, select: { id: true } });
  if (!household) withError(back, "That customer no longer exists.");

  // A device can only be attached if it belongs to this same customer.
  if (t.deviceId) {
    const device = await db.device.findFirst({
      where: { id: t.deviceId, householdId: t.householdId },
      select: { id: true },
    });
    if (!device) withError(back, "That device doesn't belong to this customer.");
  }

  const ticket = await db.supportTicket.create({
    data: {
      householdId: t.householdId,
      deviceId: t.deviceId ?? null,
      category: t.category,
      subject: t.subject ?? null,
      description: t.description,
      priority: t.priority,
      source: t.source,
      status: t.status,
      resolvedAt: CLOSED_TICKET_STATUSES.includes(t.status) ? new Date() : null,
    },
  });

  await db.auditLog.create({
    data: {
      actorUserId: userId,
      action: "ticket_created",
      targetType: "SupportTicket",
      targetId: ticket.id,
      metadata: { householdId: t.householdId, source: t.source },
    },
  });

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/customers/${t.householdId}`);
  redirect(`/admin/tickets/${ticket.id}`);
}

const ticketUpdateSchema = z.object({
  ticketId: z.string().min(1),
  status: z.nativeEnum(TicketStatus),
  priority: z.nativeEnum(TicketPriority),
});

export async function updateTicket(formData: FormData): Promise<void> {
  const { userId } = await requireAdminActor();

  const ticketId = text(formData, "ticketId") ?? "";
  const back = `/admin/tickets/${encodeURIComponent(ticketId)}`;

  const parsed = ticketUpdateSchema.safeParse({
    ticketId,
    status: text(formData, "status"),
    priority: text(formData, "priority"),
  });
  if (!parsed.success) withError(back, "Those ticket settings aren't valid.");
  const u = parsed.data;

  const existing = await db.supportTicket.findUnique({
    where: { id: u.ticketId },
    select: { id: true, householdId: true, resolvedAt: true },
  });
  if (!existing) redirect("/admin/tickets");

  const nowClosed = CLOSED_TICKET_STATUSES.includes(u.status);
  await db.supportTicket.update({
    where: { id: u.ticketId },
    data: {
      status: u.status,
      priority: u.priority,
      // Keep the original resolved time if it's already closed; clear it on reopen.
      resolvedAt: nowClosed ? existing.resolvedAt ?? new Date() : null,
    },
  });

  await db.auditLog.create({
    data: {
      actorUserId: userId,
      action: "ticket_updated",
      targetType: "SupportTicket",
      targetId: u.ticketId,
      metadata: { status: u.status, priority: u.priority },
    },
  });

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/customers/${existing.householdId}`);
  redirect(back);
}

const messageSchema = z.object({
  ticketId: z.string().min(1),
  content: z.string().min(1, "Write something first.").max(4000, "Keep it under 4000 characters."),
});

export async function addTicketMessage(formData: FormData): Promise<void> {
  const { userId } = await requireAdminActor();

  const ticketId = text(formData, "ticketId") ?? "";
  const back = `/admin/tickets/${encodeURIComponent(ticketId)}`;

  const parsed = messageSchema.safeParse({ ticketId, content: text(formData, "content") ?? "" });
  if (!parsed.success) withError(back, firstError(parsed.error));
  const m = parsed.data;

  const existing = await db.supportTicket.findUnique({ where: { id: m.ticketId }, select: { id: true } });
  if (!existing) redirect("/admin/tickets");

  await db.supportMessage.create({
    data: {
      ticketId: m.ticketId,
      authorUserId: userId,
      content: m.content,
      // Checkbox is "on" when ticked, absent otherwise.
      internal: formData.get("internal") === "on",
    },
  });

  revalidatePath(back);
  redirect(back);
}

// ---------- customers ----------

const customerSchema = z.object({
  name: z.string().min(1, "Enter the customer's name.").max(100),
  email: z.string().email("That email address doesn't look right.").max(200),
  phone: optionalText(30),
  address: optionalText(200),
  planId: z.string().optional(),
  status: z.nativeEnum(SubscriptionStatus),
  squareCustomerId: optionalText(100),
  squareSubscriptionId: optionalText(100),
});

/**
 * Manual customer activation: creates the household and its primary user.
 * Customers get an unusable random password (there's no password-reset or
 * invite flow yet), so they can't sign in to the portal until one exists.
 */
export async function createCustomer(formData: FormData): Promise<void> {
  const { userId } = await requireAdminActor();
  const back = "/admin/customers/new";

  const parsed = customerSchema.safeParse({
    name: text(formData, "name") ?? "",
    email: (text(formData, "email") ?? "").toLowerCase(),
    phone: text(formData, "phone"),
    address: text(formData, "address"),
    planId: text(formData, "planId"),
    status: text(formData, "status") ?? "ACTIVE",
    squareCustomerId: text(formData, "squareCustomerId"),
    squareSubscriptionId: text(formData, "squareSubscriptionId"),
  });
  if (!parsed.success) withError(back, firstError(parsed.error));
  const c = parsed.data;

  const emailTaken = await db.user.findUnique({ where: { email: c.email }, select: { id: true } });
  if (emailTaken) withError(back, "A customer with that email already exists.");

  if (c.planId) {
    const plan = await db.plan.findUnique({ where: { id: c.planId }, select: { id: true } });
    if (!plan) withError(back, "That plan no longer exists.");
  }

  if (c.squareSubscriptionId) {
    const subTaken = await db.subscription.findUnique({
      where: { squareSubscriptionId: c.squareSubscriptionId },
      select: { id: true },
    });
    if (subTaken) withError(back, "That Square subscription ID is already saved on another customer.");
  }

  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

  const household = await db.household.create({
    data: {
      phone: c.phone ?? null,
      email: c.email,
      address: c.address ?? null,
      planId: c.planId ?? null,
      subscriptionStatus: c.status,
      squareCustomerId: c.squareCustomerId ?? null,
      squareSubscriptionId: c.squareSubscriptionId ?? null,
      users: { create: { name: c.name, email: c.email, phone: c.phone ?? null, passwordHash, role: "CUSTOMER" } },
      // A Subscription row needs both a plan and the Square subscription ID.
      ...(c.planId && c.squareSubscriptionId
        ? {
            subscriptions: {
              create: { planId: c.planId, squareSubscriptionId: c.squareSubscriptionId, status: c.status },
            },
          }
        : {}),
    },
  });

  await db.auditLog.create({
    data: {
      actorUserId: userId,
      action: "customer_created",
      targetType: "Household",
      targetId: household.id,
      metadata: { planId: c.planId ?? null, status: c.status },
    },
  });

  revalidatePath("/admin/customers");
  redirect(`/admin/customers/${household.id}`);
}
