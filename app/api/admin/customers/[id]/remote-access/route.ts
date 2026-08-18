import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNotificationProvider } from "@/lib/providers/notification-provider";
import { businessConfig } from "@/lib/config/business";

/**
 * Interim remote-access solution until real RMM lands (see RMMProvider).
 * Emails the household's primary contact a plain-language RustDesk download
 * link and instructions. RustDesk is free for this scale of use; Quick
 * Assist (Windows built-in) remains the tool for live, on-the-phone
 * walkthroughs since it can't be pre-sent the same way.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const household = await db.household.findUnique({
    where: { id: params.id },
    include: { users: true },
  });

  const recipient = household?.users[0];
  if (!household || !recipient) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const emailBody = `Hi ${recipient.name.split(" ")[0]},

To help with your computer remotely, please visit this page and follow the steps:

${businessConfig.domain ? `https://${businessConfig.domain}/connect` : "/connect"}

It'll walk you through downloading a free connection tool and calling us with a code — takes just a couple of minutes.

A reminder for your safety: only share that code with someone from ${businessConfig.name} who you called or who called you as part of a scheduled appointment. We will never ask you to install anything or share a code out of the blue.

If anything is confusing, just call us at ${businessConfig.phone} and we'll walk you through it.

— ${businessConfig.name}`;

  try {
    await getNotificationProvider().sendCustomerEmail(
      recipient.email,
      `How to connect with ${businessConfig.name} remotely`,
      emailBody
    );
  } catch (err) {
    console.error("Failed to send remote access email", err);
    return NextResponse.json({ error: "Email failed to send. Check EMAIL_API_KEY / Resend setup." }, { status: 502 });
  }

  const adminUserId = (session.user as any).id as string | undefined;
  if (adminUserId) {
    await db.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: "remote_access_instructions_sent",
        targetType: "Household",
        targetId: household.id,
        metadata: { channel: "email", tool: "rustdesk" },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
