import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { plansConfig } from "../lib/config/plans";

const db = new PrismaClient();

async function main() {
  // Plans — all 4: 3 Home Computer Care tiers + Senior Safe Computing
  const planRecords: Record<string, Awaited<ReturnType<typeof db.plan.upsert>>> = {};
  for (const [i, p] of plansConfig.entries()) {
    planRecords[p.key] = await db.plan.upsert({
      where: { id: p.key },
      update: {},
      create: {
        id: p.key,
        name: p.name,
        priceCents: p.priceCents,
        description: p.description,
        features: p.features,
        isActive: true,
        sortOrder: i,
      },
    });
  }
  const basicPlan = planRecords["basic"];
  const premiumPlan = planRecords["premium"];
  const completePlan = planRecords["complete"];
  const seniorPlan = planRecords["senior-safe"];

  // Admin user
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 10);
  await db.user.upsert({
    where: { email: "admin@itcomps.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@itcomps.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const householdSeeds = [
    { name: "Mary Thompson", plan: seniorPlan, status: "ACTIVE" as const, deviceStatus: "GREEN" as const, onboarded: true },
    { name: "Robert Diaz", plan: basicPlan, status: "ACTIVE" as const, deviceStatus: "GREEN" as const, onboarded: true },
    { name: "Helen Carter", plan: seniorPlan, status: "ACTIVE" as const, deviceStatus: "YELLOW" as const, onboarded: true },
    { name: "George Whitfield", plan: basicPlan, status: "PENDING" as const, deviceStatus: "UNKNOWN" as const, onboarded: false },
    { name: "Patricia Nguyen", plan: seniorPlan, status: "ACTIVE" as const, deviceStatus: "RED" as const, onboarded: true },
    { name: "Walter Simmons", plan: premiumPlan, status: "PAST_DUE" as const, deviceStatus: "GREEN" as const, onboarded: true },
    { name: "Betty Alvarez", plan: completePlan, status: "ACTIVE" as const, deviceStatus: "GREEN" as const, onboarded: true },
    { name: "Frank Osei", plan: premiumPlan, status: "ACTIVE" as const, deviceStatus: "GREEN" as const, onboarded: true },
    { name: "Dorothy Kim", plan: seniorPlan, status: "CANCELED" as const, deviceStatus: "UNKNOWN" as const, onboarded: true },
    { name: "Samuel Green", plan: completePlan, status: "PENDING" as const, deviceStatus: "UNKNOWN" as const, onboarded: false },
  ];

  for (const seed of householdSeeds) {
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const email = `${seed.name.toLowerCase().replace(/\s+/g, ".")}@example.com`;

    const household = await db.household.create({
      data: {
        planId: seed.plan.id,
        subscriptionStatus: seed.status,
        phone: "704-555-0100",
        email,
        users: {
          create: {
            name: seed.name,
            email,
            passwordHash,
            role: "CUSTOMER",
          },
        },
        devices: seed.onboarded
          ? {
              create: {
                name: `${seed.name.split(" ")[0]}'s Computer`,
                manufacturer: "Dell",
                model: "Inspiron 15",
                os: "Windows",
                osVersion: "11",
                status: seed.deviceStatus,
                lastCheckIn: new Date(),
                lastHealthCheck: new Date(),
              },
            }
          : undefined,
        onboardingSteps: {
          create: seed.onboarded
            ? [
                { stepKey: "about_you", completedAt: new Date() },
                { stepKey: "who_is_this_for", completedAt: new Date() },
                { stepKey: "computer_info", completedAt: new Date() },
                { stepKey: "computer_status", completedAt: new Date() },
                { stepKey: "connect_computer", completedAt: new Date() },
                { stepKey: "initial_health_check", completedAt: new Date() },
                { stepKey: "complete", completedAt: new Date() },
              ]
            : [{ stepKey: "about_you", completedAt: new Date() }],
        },
      },
    });

    if (seed.deviceStatus === "RED") {
      const device = await db.device.findFirst({ where: { householdId: household.id } });
      if (device) {
        await db.supportTicket.create({
          data: {
            householdId: household.id,
            deviceId: device.id,
            category: "Suspicious message/email",
            description: "Customer reported a pop-up claiming their computer was compromised.",
            priority: "HIGH",
            status: "NEW",
          },
        });
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
