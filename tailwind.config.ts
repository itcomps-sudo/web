import type { Config } from "tailwindcss";

// Design tokens for IT Computer Solutions / Senior Safe Computing.
// Palette: a trustworthy deep navy (not corporate black) paired with a warm
// amber accent and a muted sage green reserved for "protected/healthy"
// status — deliberately not the generic cream+terracotta or dark+neon
// defaults. Display serif for warmth/heritage, a highly legible civic-style
// sans for body copy (this audience needs readability over trendiness).

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2A41", // primary text, headers, nav
        paper: "#FAF8F2", // page background
        amber: {
          DEFAULT: "#C1872E",
          dark: "#9C6B1F",
        },
        sage: {
          DEFAULT: "#3F7D58", // "protected / green" status
          light: "#E4EFE8",
        },
        clay: {
          DEFAULT: "#B14A3D", // "needs attention / red" status, used sparingly
          light: "#F5E6E3",
        },
        mist: "#E4E0D6", // borders, dividers, card backgrounds
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        base: ["1.125rem", "1.7"], // 18px base — accessibility floor for this audience
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
