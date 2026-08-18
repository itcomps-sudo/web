/**
 * Purely decorative background graphic for the homepage hero. Abstract
 * concentric arcs suggest a signal being watched / a device being looked
 * after, echoing the WatchRibbon motif without competing with the headline
 * text. Rendered behind content with aria-hidden.
 */
export function HeroGraphic() {
  return (
    <svg
      viewBox="0 0 600 600"
      aria-hidden
      className="pointer-events-none absolute -right-24 -top-24 h-[520px] w-[520px] opacity-[0.35] md:opacity-60"
    >
      <circle cx="380" cy="220" r="220" fill="none" stroke="#C1872E" strokeWidth="1.5" opacity="0.35" />
      <circle cx="380" cy="220" r="160" fill="none" stroke="#3F7D58" strokeWidth="1.5" opacity="0.35" />
      <circle cx="380" cy="220" r="100" fill="none" stroke="#1B2A41" strokeWidth="1.5" opacity="0.25" />
      <circle cx="380" cy="220" r="10" fill="#C1872E" />
    </svg>
  );
}
