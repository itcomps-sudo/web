import { db } from "@/lib/db";

/**
 * The steps to finish when a new customer signs up. They are stored in the
 * existing OnboardingStep table with a "setup_" prefix, so they never mix
 * with the customer-facing onboarding steps.
 */
export const SETUP_STEPS = [
  { key: "setup_square_customer", label: "Square customer created", hint: "Customer profile exists in Square" },
  { key: "setup_fee", label: "Setup fee charged", hint: "$100 through Virtual Terminal, card saved on file" },
  { key: "setup_subscription", label: "Subscription created, with tax", hint: "Billing summary shows the 6.75% tax line" },
  { key: "setup_portal", label: "Customer added to the portal", hint: "Imported from Square" },
  { key: "setup_device", label: "Computer added with RustDesk ID", hint: "Model, CPU, antivirus and backup noted" },
  { key: "setup_remote_test", label: "Remote access tested", hint: "Connected once with RustDesk" },
  { key: "setup_security_backup", label: "Security and backup set up", hint: "Antivirus, updates and backup checked" },
  { key: "setup_walkthrough", label: "Customer walked through what they get", hint: "Plan, how to reach you, billing date" },
  { key: "setup_followup", label: "First-month follow-up done", hint: "Quick check-in after the first month" },
] as const;

export const SETUP_STEP_KEYS: string[] = SETUP_STEPS.map((s) => s.key);

/** Marks one setup step done (or not done) for a customer. */
export async function setSetupStep(householdId: string, stepKey: string, done: boolean): Promise<void> {
  await db.onboardingStep.upsert({
    where: { householdId_stepKey: { householdId, stepKey } },
    update: { completedAt: done ? new Date() : null },
    create: { householdId, stepKey, completedAt: done ? new Date() : null },
  });
}
