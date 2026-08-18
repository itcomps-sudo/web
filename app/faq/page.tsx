import { HelpCircle } from "lucide-react";
import { businessConfig } from "@/lib/config/business";

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-ink">Frequently Asked Questions</h1>
      <div className="mt-10 space-y-5">
        {businessConfig.faq.map((item) => (
          <div key={item.question} className="rounded-xl2 border border-mist bg-white p-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="mt-1 h-5 w-5 flex-shrink-0 text-amber-dark" aria-hidden />
              <div>
                <h2 className="text-xl font-semibold text-ink">{item.question}</h2>
                <p className="mt-2 text-lg text-ink/80">{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
