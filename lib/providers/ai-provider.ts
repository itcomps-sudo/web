/**
 * AIProvider abstraction.
 *
 * The rest of the application should only ever talk to this interface, never
 * to the Anthropic SDK directly. That keeps a future provider swap (or a
 * multi-provider setup) to a single file.
 *
 * IMPORTANT: business facts (plans, prices, policies, FAQ) are injected into
 * the system prompt from lib/config — the model is never allowed to be the
 * source of truth for that information. See buildSystemPrompt().
 */

import Anthropic from "@anthropic-ai/sdk";
import { businessConfig } from "../config/business";
import { plansConfig } from "../config/plans";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type IntentClassification =
  | "REPAIR_CUSTOMER"
  | "SENIOR_SAFE_PROSPECT"
  | "FAMILY_MEMBER_FOR_SENIOR"
  | "EXISTING_CUSTOMER_SUPPORT"
  | "GENERAL_QUESTION"
  | "BUSINESS_IT_PROSPECT"
  | "UNKNOWN";

export interface AIProvider {
  chat(messages: ChatMessage[], context?: Record<string, unknown>): Promise<string>;
  classifyIntent(messages: ChatMessage[]): Promise<IntentClassification>;
  summarizeConversation(messages: ChatMessage[]): Promise<string>;
  generateSupportSummary(ticketDescription: string, deviceContext?: string): Promise<string>;
}

function buildSystemPrompt(customerContext?: Record<string, unknown>): string {
  const homeCareSummaries = plansConfig
    .filter((p) => p.group === "home_care")
    .map(
      (p) =>
        `- ${p.name}: $${(p.priceCents / 100).toFixed(2)}/month. ${p.description} Features: ${p.features.join(
          ", "
        )}.`
    )
    .join("\n");

  const seniorPlan = plansConfig.find((p) => p.group === "senior_safe");
  const seniorSummary = seniorPlan
    ? `- ${seniorPlan.name}: $${(seniorPlan.priceCents / 100).toFixed(2)}/month. ${seniorPlan.description} Features: ${seniorPlan.features.join(", ")}.`
    : "";

  return `
You are the AI concierge for ${businessConfig.name}, a small, trusted IT consulting
business.

${businessConfig.name} offers two distinct recurring memberships — do not conflate them:
1. Home Computer Care Membership — a general-audience plan (3 tiers) for anyone's computer.
2. Senior Safe Computing — a separate, senior-specific membership with different features and price.

Tone: warm, plain-spoken, reassuring, never salesy or gimmicky. Avoid technical jargon
unless the visitor uses it first. If a visitor is asking on behalf of an older parent or
relative, guide them toward Senior Safe Computing; otherwise Home Computer Care is the
default recommendation.

You may ONLY state business facts (prices, features, policies, hours, contact info)
that appear below. Never invent prices, discounts, guarantees, or technical capabilities.
If you don't know something, say so plainly and offer to connect the visitor with
${businessConfig.name} directly — do not guess.

Never ask for passwords, credit card numbers, or MFA codes. Never claim to have
completed an action (like activating a subscription) unless the context below
confirms it. If a next step requires a human, say so clearly.

BUSINESS FACTS:
Name: ${businessConfig.name}
Phone: ${businessConfig.phone}
Email: ${businessConfig.email}
Hours: ${businessConfig.hours}

Home Computer Care Membership plans:
${homeCareSummaries}

Senior Safe Computing plan:
${seniorSummary}

Traditional IT services offered: ${businessConfig.services.join(", ")}

FAQ:
${businessConfig.faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

Support policy: ${businessConfig.supportPolicies.responseTime} ${businessConfig.supportPolicies.scopeNote}

${customerContext ? `AUTHENTICATED CUSTOMER CONTEXT (only use for this customer, never reference another household's data):\n${JSON.stringify(customerContext, null, 2)}` : "This visitor is not logged in — do not claim knowledge of any account, device, or subscription."}
`.trim();
}

class AnthropicAIProvider implements AIProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.AI_API_KEY });
  }

  async chat(messages: ChatMessage[], context?: Record<string, unknown>): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: buildSystemPrompt(context),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock && "text" in textBlock ? textBlock.text : "";
  }

  async classifyIntent(messages: ChatMessage[]): Promise<IntentClassification> {
    const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 20,
      system:
        "Classify the visitor's primary intent from this conversation. Respond with exactly one of: REPAIR_CUSTOMER, SENIOR_SAFE_PROSPECT, FAMILY_MEMBER_FOR_SENIOR, EXISTING_CUSTOMER_SUPPORT, GENERAL_QUESTION, BUSINESS_IT_PROSPECT, UNKNOWN. No other text.",
      messages: [{ role: "user", content: transcript }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text.trim() : "UNKNOWN";
    const valid: IntentClassification[] = [
      "REPAIR_CUSTOMER",
      "SENIOR_SAFE_PROSPECT",
      "FAMILY_MEMBER_FOR_SENIOR",
      "EXISTING_CUSTOMER_SUPPORT",
      "GENERAL_QUESTION",
      "BUSINESS_IT_PROSPECT",
      "UNKNOWN",
    ];
    return (valid.includes(raw as IntentClassification) ? raw : "UNKNOWN") as IntentClassification;
  }

  async summarizeConversation(messages: ChatMessage[]): Promise<string> {
    const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system: "Summarize this website conversation in 2-3 sentences for an internal staff member. Be factual, no speculation.",
      messages: [{ role: "user", content: transcript }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock && "text" in textBlock ? textBlock.text : "";
  }

  async generateSupportSummary(ticketDescription: string, deviceContext?: string): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system:
        "Summarize this support request in 1-2 sentences for a technician triage queue. Be factual, do not diagnose or guess at a root cause you cannot verify.",
      messages: [
        {
          role: "user",
          content: `Request: ${ticketDescription}\n${deviceContext ? `Device context: ${deviceContext}` : ""}`,
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock && "text" in textBlock ? textBlock.text : "";
  }
}

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_provider) _provider = new AnthropicAIProvider();
  return _provider;
}
