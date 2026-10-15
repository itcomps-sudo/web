/**
 * Creates an admin login (or promotes an existing user to admin).
 *
 * Run from the project root:
 *   npx tsx scripts/create-admin.ts
 *
 * - The password is typed at a hidden prompt; it is never put in a file or
 *   on the command line.
 * - It prints which database host it is about to change and waits for you
 *   to type "yes", so you never write to the live database by accident.
 */
import { existsSync, readFileSync } from "node:fs";
import readline from "node:readline";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

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

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const anyRl = rl as any;
    anyRl.stdoutMuted = false;
    anyRl._writeToOutput = (text: string) => {
      anyRl.output.write(anyRl.stdoutMuted ? "" : text);
    };
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
    // Mute only after the prompt text has been printed.
    anyRl.stdoutMuted = hidden;
  });
}

async function main() {
  const host = databaseHost();
  console.log(`\nThis will change the database at: ${host}`);
  const go = (await ask('Type "yes" to continue: ')).trim().toLowerCase();
  if (go !== "yes") {
    console.log("Cancelled. Nothing was changed.");
    return;
  }

  const name = (await ask("Your name: ")).trim();
  const email = (await ask("Admin email: ")).trim().toLowerCase();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.log("That name or email doesn't look right. Nothing was changed.");
    return;
  }

  const password = await ask("Choose a password (at least 12 characters, hidden): ", true);
  const again = await ask("Type it again: ", true);
  if (password.length < 12) {
    console.log("Password must be at least 12 characters. Nothing was changed.");
    return;
  }
  if (password !== again) {
    console.log("The two passwords didn't match. Nothing was changed.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await db.user.findUnique({ where: { email }, select: { id: true, role: true } });

  if (existing) {
    const ok = (
      await ask(`${email} already exists (currently ${existing.role}). Make them an admin and reset the password? (yes/no): `)
    )
      .trim()
      .toLowerCase();
    if (ok !== "yes") {
      console.log("Cancelled. Nothing was changed.");
      return;
    }
    await db.user.update({ where: { email }, data: { role: "ADMIN", passwordHash, name } });
    console.log(`\nDone. ${email} is now an admin with the new password.`);
  } else {
    await db.user.create({ data: { name, email, passwordHash, role: "ADMIN" } });
    console.log(`\nDone. Admin created: ${email}`);
  }

  console.log(`Sign in at /portal/sign-in with that exact email in lowercase.`);
}

main()
  .catch((err) => {
    console.error("Failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
