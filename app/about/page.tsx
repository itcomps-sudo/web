import { businessConfig } from "@/lib/config/business";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-ink">About {businessConfig.name}</h1>
      <p className="mt-6 text-xl leading-relaxed text-ink/80">
        {businessConfig.name} has been helping people with their computers for more than
        20 years. Senior Safe Computing grew out of a simple pattern we kept seeing:
        families wanted someone trustworthy to call before a small computer problem
        became a big one — and to keep watching after the first fix, not just once.
      </p>
      <p className="mt-6 text-xl leading-relaxed text-ink/80">
        We&apos;re a small, local business. When you call, you reach someone who knows
        what they&apos;re doing and treats your time and trust with respect.
      </p>
    </div>
  );
}
