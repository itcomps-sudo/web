/**
 * Plan definitions.
 *
 * Two distinct products, per the approved brochure:
 *   - Home Computer Care Membership: general-audience, 3 tiers
 *   - Senior Safe Computing: a single, senior-specific membership
 *
 * This is the seed source for the `plans` table (see prisma/seed.ts) and the
 * single place the AI concierge and the marketing pages should read plan
 * facts from. Changing a plan here (and re-seeding, or eventually editing it
 * in the admin UI) changes it everywhere — the AI is never told plan facts
 * any other way.
 */

export type PlanGroup = "home_care" | "senior_safe";
export type AccentColor = "sage" | "amber" | "ink";

export type PlanConfig = {
  key: string;
  group: PlanGroup;
  name: string;
  priceCents: number;
  description: string;
  isPopular: boolean;
  accent: AccentColor;
  features: string[];
  perfectFor: string;
};

export const homeCarePlans: PlanConfig[] = [
  {
    key: "basic",
    group: "home_care",
    name: "Basic Care",
    priceCents: 1499,
    description: "Protection without the worry of computer maintenance.",
    isPopular: false,
    accent: "sage",
    perfectFor: "Casual home users who want protection without worrying about computer maintenance.",
    features: [
      "Managed antivirus protection",
      "Windows updates monitoring",
      "Monthly device health check",
      "Security monitoring",
      "10% discount on repairs",
      "Priority scheduling",
    ],
  },
  {
    key: "premium",
    group: "home_care",
    name: "Premium Care",
    priceCents: 2499,
    description: "Everything in Basic, with more active protection and monitoring.",
    isPopular: true,
    accent: "amber",
    perfectFor: "Families, remote workers, and home offices.",
    features: [
      "Advanced malware protection",
      "Dangerous website blocking",
      "Remote monitoring",
      "Unlimited remote health checks",
      "20% discount on repairs",
      "Annual PC tune-up",
      "Software update management",
    ],
  },
  {
    key: "complete",
    group: "home_care",
    name: "Complete Protection",
    priceCents: 3999,
    description: "Everything in Premium, plus backup and priority emergency support.",
    isPopular: false,
    accent: "ink",
    perfectFor: "Customers who store photos, financial information, and important documents.",
    features: [
      "Cloud backup monitoring",
      "Ransomware protection",
      "Priority remote support",
      "Annual system optimization",
      "Data recovery discounts",
      "Family device coverage (up to 3 devices)",
      "Emergency support assistance",
    ],
  },
];

export const seniorSafePlan: PlanConfig = {
  key: "senior-safe",
  group: "senior_safe",
  name: "Senior Safe Computing",
  priceCents: 2999,
  description: "Designed specifically for seniors — a trusted local expert, just a phone call away.",
  isPopular: false,
  accent: "amber",
  perfectFor: "Seniors and the families who look out for them.",
  features: [
    "Computer security protection",
    "Scam and phishing assistance",
    "Unlimited remote help",
    "Printer assistance",
    "Email assistance",
    "Quarterly computer checkups",
    "Family contact option (if requested)",
    "Priority support",
  ],
};

export const plansConfig: PlanConfig[] = [...homeCarePlans, seniorSafePlan];

