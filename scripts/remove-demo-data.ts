/**
 * Removes the demo data created by prisma/seed.ts:
 *   - households whose email AND every user's email end in @example.com
 *     (plus their users, devices, tickets, notes and onboarding steps)
 *   - the starter admin account admin@itcomps.com
 *
 * Run from the project root, AFTER you have created your own admin:
 *   npx tsx scripts/remove-demo-data.ts
 *
 * It lists exactly what it will delete, shows which database it is
 * connected to, and waits for you to type "yes". Plans are left alone.
 * Real customers are never matched, because only @example.com households
 * are touched.
 */
import { existsSync, readFileSync } from "node:fs";
import readline from "node:readline";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const DEFAULT_ADMIN_EMAIL = "admin@itcomps.com";

function databaseHost(): string {
  let url = process.env.DATABASE_URL;
  if (!url && existsSync(".env")) {
    const match = readFileSync(".env", "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
    url = match?.[1];
  }
  try {
    return new URL(url ?? "").host;
  } catch {
    return "(could not read DATABASE_URL)";
  }
}

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log(`\nConnected to database at: ${databaseHost()}`);

  const households = await db.household.findMany({
    where: {
      email: { endsWith: "@example.com" },
      users: { every: { email: { endsWith: "@example.com" } } },
    },
    select: { id: true, email: true },
  });
  const householdIds = households.map((h: { id: string }) => h.id);

  const defaultAdmin = await db.user.findUnique({ where: { email: DEFAULT_ADMIN_EMAIL }, select: { id: true } });
  const otherAdmins = await db.user.count({
    where: { role: "ADMIN", email: { not: DEFAULT_ADMIN_EMAIL } },
  });

  if (defaultAdmin && otherAdmins === 0) {
    console.log(
      `\nStopped. ${DEFAULT_ADMIN_EMAIL} is your only admin. Create your own admin first with:\n  npx tsx scripts/create-admin.ts\nThen run this again. Nothing was changed.`
    );
    return;
  }

  // The starter admin can only be deleted if nothing points at it.
  let deleteDefaultAdmin = false;
  if (defaultAdmin) {
    const [audit, notes, messages] = await Promise.all([
      db.auditLog.count({ where: { actorUserId: defaultAdmin.id } }),
      db.note.count({ where: { authorUserId: defaultAdmin.id } }),
      db.supportMessage.count({ where: { authorUserId: defaultAdmin.id } }),
    ]);
    if (audit + notes + messages === 0) {
      deleteDefaultAdmin = true;
    } else {
      console.log(`\nNote: ${DEFAULT_ADMIN_EMAIL} has history attached, so it will be kept, not deleted.`);
      console.log("Reset its password with create-admin.ts instead, using a long random password.");
    }
  }

  if (householdIds.length === 0 && !deleteDefaultAdmin) {
    console.log("\nNo demo data found. Nothing to do.");
    return;
  }

  const [devices, tickets] = await Promise.all([
    db.device.count({ where: { householdId: { in: householdIds } } }),
    db.supportTicket.count({ where: { householdId: { in: householdIds } } }),
  ]);

  console.log("\nThis will permanently delete:");
  console.log(`  - ${householdIds.length} demo households (emails ending @example.com), with their users`);
  console.log(`  - ${devices} devices and ${tickets} tickets belonging to them`);
  if (deleteDefaultAdmin) console.log(`  - the starter admin account ${DEFAULT_ADMIN_EMAIL}`);
  for (const h of households as { email: string | null }[]) console.log(`      ${h.email}`);

  const go = (await ask('\nType "yes" to delete: ')).trim().toLowerCase();
  if (go !== "yes") {
    console.log("Cancelled. Nothing was changed.");
    return;
  }

  const inDemo = { householdId: { in: householdIds } };
  await db.$transaction([
    db.supportMessage.deleteMany({ where: { ticket: inDemo } }),
    db.supportTicket.deleteMany({ where: inDemo }),
    db.note.deleteMany({ where: inDemo }),
    db.onboardingStep.deleteMany({ where: inDemo }),
    db.device.deleteMany({ where: inDemo }),
    db.subscription.deleteMany({ where: inDemo }),
    db.user.deleteMany({ where: inDemo }),
    db.household.deleteMany({ where: { id: { in: householdIds } } }),
    ...(deleteDefaultAdmin ? [db.user.delete({ where: { email: DEFAULT_ADMIN_EMAIL } })] : []),
  ]);

  console.log("\nDone. Demo data removed.");
}

main()
  .catch((err) => {
    console.error("Failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
