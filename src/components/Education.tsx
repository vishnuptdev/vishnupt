import { motion, useReducedMotion } from "framer-motion";
import { education } from "../content";

// Chapter 6 — education as a calm credits page. The split-flap board is gone: cycling
// glyphs made the facts unreadable, and the owner called it out until it changed. Now
// three lines at reading size in the display face, each rising on its own beat with a
// full half-second of air between them, over the drifting flight paths. Reduced motion
// lands everything settled. Facts verbatim from content/profile.md.

export default function Education() {
  const reduced = useReducedMotion();
  const up = (at: number) => ({
    initial: reduced ? false : { opacity: 0, y: 22, filter: "blur(8px)" },
    whileInView: reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: 0.9, delay: at, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section
      id="education"
      aria-label="Education"
      className="relative flex min-h-svh scroll-mt-20 items-center justify-center px-4"
    >
      {/* departures, literally: dashed flight paths drift across the board's sky, three
          routes at three speeds, destination nodes blinking */}
      <span aria-hidden className="fx fx-paths">
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-full w-full">
          <path d="M-5 45 Q 30 8 65 30 T 105 12" />
          <path d="M-5 20 Q 40 52 70 26 T 105 40" />
          <path d="M10 60 Q 45 20 80 44 T 110 6" />
          <circle cx="30" cy="26" r="0.9" className="node" />
          <circle cx="65" cy="30" r="0.9" className="node n2" />
          <circle cx="80" cy="44" r="0.9" className="node n3" />
        </svg>
      </span>
      <div className="relative w-full max-w-3xl text-center">
        <motion.p className="text-[11px] uppercase tracking-[0.45em] text-bone/55" {...up(0.2)}>
          roots — education
        </motion.p>
        <motion.h2 className="mt-8 font-display text-3xl leading-tight text-bone sm:text-5xl" {...up(0.7)}>
          {education.degree}
        </motion.h2>
        <motion.p className="mt-5 text-base leading-relaxed text-bone/80 sm:text-lg" {...up(1.3)}>
          {education.college} — {education.place}
        </motion.p>
        <motion.p className="mt-4 font-mono text-sm text-amber sm:text-base" {...up(1.9)}>
          {education.years}
        </motion.p>
      </div>
    </section>
  );
}
