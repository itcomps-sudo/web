import { MapPin, GraduationCap, Zap, FileX, Smile } from "lucide-react";

const points = [
  { icon: MapPin, label: "Local support" },
  { icon: GraduationCap, label: "Experienced IT professionals" },
  { icon: Zap, label: "Fast response times" },
  { icon: FileX, label: "No long-term contracts" },
  { icon: Smile, label: "Friendly, personalized service" },
];

export function WhyChooseUs() {
  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-semibold text-paper">
          Why choose {`IT Computer Solutions`}?
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {points.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper/10">
                <Icon className="h-6 w-6 text-amber" aria-hidden strokeWidth={2} />
              </div>
              <p className="text-lg leading-snug text-paper/90">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
