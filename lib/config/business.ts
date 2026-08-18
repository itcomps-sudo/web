/**
 * Central business configuration.
 *
 * Everything the website and the AI concierge say about the business lives here
 * (or, later, in an admin-editable table backed by this same shape). Nothing in
 * this file should be duplicated as hard-coded copy inside components — pages
 * and the AI prompt should both read from this single source.
 *
 * TODO (Phase 10): move this into a `business_config` DB table with an admin
 * editing UI. Keeping it as a typed object for now makes the MVP easy to stand
 * up without a config UI blocking launch.
 */

export const businessConfig = {
  name: "IT Computer Solutions",
  tagline: "Technology shouldn't be frustrating.",
  domain: "itcomps.com",
  phone: "(704) 882-5188",
  email: "support@itcomps.com",
  hours: "Monday–Friday, 9am–5pm Eastern",
  address: "Indian Trail, NC", // placeholder — update to your real service area

  homeComputerCare: {
    name: "Home Computer Care Membership",
    tagline: "Stop paying for computer repairs every time something goes wrong.",
    intro:
      "Join our Home Computer Care Membership and enjoy ongoing protection, maintenance, and support from a trusted local technology company.",
  },

  seniorSafeComputing: {
    name: "Senior Safe Computing",
    tagline: "Have a trusted local computer expert just a phone call away.",
    intro:
      "Whether it's a suspicious email, a printer issue, or a computer problem, Senior Safe Computing keeps technology safe and running smoothly — with a real person to call, not just an app.",
  },

  services: [
    "Computer repair",
    "Computer setup",
    "Windows support",
    "Microsoft 365 assistance",
    "Virus and malware assistance",
    "Networking",
    "Printer support",
    "Data migration",
    "Business IT support",
    "On-site service",
  ],

  faq: [
    {
      question: "What is Senior Safe Computing?",
      answer:
        "It's an ongoing membership that keeps your computer protected, maintained, and gives you someone to call when something goes wrong — for a flat monthly price.",
    },
    {
      question: "Is this a one-time repair or an ongoing service?",
      answer:
        "It's ongoing. You're billed monthly, and in return your computer is monitored and looked after continuously, not just fixed once.",
    },
    {
      question: "Can I buy this for a parent who lives elsewhere?",
      answer:
        "Yes. Many customers set this up for a parent or spouse. You can be the one who signs up and manages billing while your family member uses the computer.",
    },
    {
      question: "What if I'm not sure which plan I need?",
      answer:
        "Ask our AI assistant on the website, or call us directly — we're happy to help you figure out what fits.",
    },
  ],

  supportPolicies: {
    responseTime:
      "We aim to respond to all support requests within one business day.",
    scopeNote:
      "Senior Safe Computing covers remote assistance and monitoring described in your plan. Certain on-site or hardware-repair situations may require a separate appointment.",
  },
} as const;

export type BusinessConfig = typeof businessConfig;
