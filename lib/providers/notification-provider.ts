/**
 * NotificationProvider abstraction.
 *
 * MVP ships with email only (via Resend). SMS and in-portal notifications can
 * be added later as additional methods/implementations without touching the
 * call sites below — they should always go through notify(), not a
 * vendor SDK directly.
 */

import { Resend } from "resend";
import { businessConfig } from "../config/business";

export type NotificationType =
  | "new_lead"
  | "new_subscription"
  | "new_support_request"
  | "payment_problem"
  | "device_offline"
  | "onboarding_complete";

export interface NotificationProvider {
  notifyAdmin(type: NotificationType, payload: Record<string, unknown>): Promise<void>;
  sendCustomerEmail(to: string, subject: string, body: string): Promise<void>;
}

class EmailNotificationProvider implements NotificationProvider {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.EMAIL_API_KEY);
  }

  async notifyAdmin(type: NotificationType, payload: Record<string, unknown>): Promise<void> {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!adminEmail) return;

    await this.resend.emails.send({
      from: process.env.EMAIL_FROM ?? `${businessConfig.name} <hello@${businessConfig.domain}>`,
      to: adminEmail,
      subject: `[${businessConfig.name}] ${type.replace(/_/g, " ")}`,
      text: JSON.stringify(payload, null, 2),
    });
  }

  async sendCustomerEmail(to: string, subject: string, body: string): Promise<void> {
    await this.resend.emails.send({
      from: process.env.EMAIL_FROM ?? `${businessConfig.name} <hello@${businessConfig.domain}>`,
      to,
      subject,
      text: body,
    });
  }
}

let _provider: NotificationProvider | null = null;

export function getNotificationProvider(): NotificationProvider {
  if (!_provider) _provider = new EmailNotificationProvider();
  return _provider;
}
