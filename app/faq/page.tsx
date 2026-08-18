import { businessConfig } from "@/lib/config/business";

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-ink">Frequently Asked Questions</h1>
      <div className="mt-10 space-y-8">
        {businessConfig.faq.map((item) => (
          <div key={item.question} className="border-b border-mist pb-8">
            <h2 className="text-xl font-semibold text-ink">{item.question}</h2>
            <p className="mt-3 text-lg text-ink/80">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
