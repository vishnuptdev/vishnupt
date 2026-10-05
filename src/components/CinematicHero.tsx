import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { animate, stagger } from "animejs";
import { person } from "../content";

// Chapter 1 — the opening. Veil lifts → welcome strip → the wordmark materialises centre-out
// (letters resolve around the middle, so the type grows around nothing where a body would
// stand) → name line → chips snap in from the flanks → corner dots tick → CTAs.
// Beats overlap on purpose: a queue of fades reads as UI, overlapping beats read as cinema.
// All entrances are TIME-based (never scroll-based) so flicks can't skip or smear the moment.

// the wordmark is the full name — written once, no duplicate name line under it.
// The given name burns amber; the reveal reads left to right across all three words.
const NAME_WORDS = person.name.toUpperCase().split(" ");
const WORD_AT = NAME_WORDS.map((_, w) => NAME_WORDS.slice(0, w).reduce((n, x) => n + x.length, 0));
const HL = NAME_WORDS[0].length;
const EASE = [0.16, 1, 0.3, 1] as const;

export default function CinematicHero({ start }: { start: boolean }) {
  const reduced = useReducedMotion();
  const [skipped, setSkipped] = useState(false);
  const live = (start || skipped) && !reduced;
  const settled = reduced || skipped;
  const ref = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);

  // letters hang at different depths: the cursor drags the whole wordmark apart, gently
  useEffect(() => {
    const host = ref.current;
    const h1 = wordRef.current;
    if (!host || !h1 || reduced || settled) return;
    const spans = [...h1.querySelectorAll<HTMLSpanElement>(".hw-ch")];
    const cx = (spans.length - 1) / 2;
    const depths = spans.map((_, i) => 0.35 + (Math.abs(i - cx) / cx) * 0.9);
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let inside = false;
    let raf = 0;
    let vis = false;
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      inside = true;
    };
    const onLeave = () => {
      inside = false;
    };
    const tick = () => {
      px += ((inside ? tx : 0) - px) * 0.05;
      py += ((inside ? ty : 0) - py) * 0.05;
      spans.forEach((s, i) => {
        const d = depths[i];
        s.style.translate = `${(px * 16 * d).toFixed(2)}px ${(py * 9 * d).toFixed(2)}px`;
      });
      if (vis) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => {
      vis = es[0].isIntersecting;
      if (vis) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    });
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    io.observe(host);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, settled]);

  // anime.js: hover the wordmark and the letters ripple — elastic stagger down the word,
  // once the entrance beats have finished landing
  useEffect(() => {
    const h1 = wordRef.current;
    if (!h1 || reduced || settled) return;
    const spans = [...h1.querySelectorAll<HTMLElement>(".hw-ch")];
    const go = () =>
      animate(spans, { translateY: [-16, 0], duration: 900, delay: stagger(45), ease: "outElastic" });
    let on = false;
    const t = window.setTimeout(() => {
      h1.addEventListener("pointerenter", go);
      on = true;
    }, 3200);
    return () => {
      window.clearTimeout(t);
      if (on) h1.removeEventListener("pointerenter", go);
    };
  }, [reduced, settled]);

  // scroll dolly: the composition pushes toward camera and dissolves as you leave
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const dolly = {
    y: useTransform(scrollYProgress, [0, 1], [0, -90]),
    scale: useTransform(scrollYProgress, [0, 1], [1, 1.12]),
    opacity: useTransform(scrollYProgress, [0, 0.8], [1, 0]),
  };

  const up = (from: object, at: number, dur = 0.9) => ({
    initial: settled ? false : { opacity: 0, ...from },
    animate: settled ? undefined : { opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 },
    transition: { duration: dur, delay: live ? at : 0, ease: EASE },
  });

  return (
    <section
      id="hero"
      ref={ref}
      aria-label="Introduction"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center"
    >
      {live && !settled && (
        <>
          <button
            onClick={() => setSkipped(true)}
            className="absolute right-4 top-20 z-20 border border-bone/20 px-2 py-1 text-[11px] text-bone/60 hover:text-amber sm:right-6"
          >
            skip
          </button>
          <div aria-hidden className="hero-flash" />
        </>
      )}

      <motion.div className="flex w-full flex-col items-center" style={dolly}>
        <motion.p
          className="text-[11px] uppercase tracking-[0.45em] text-bone/55"
          {...up({ y: -18, filter: "blur(8px)" }, 0.15)}
        >
          welcome to my control room
        </motion.p>

        <h1
          ref={wordRef}
          className="hero-word mt-6 flex flex-wrap justify-center gap-x-[0.28em] font-display text-[9.2vw] leading-[0.95] sm:text-[6vw] lg:text-[5.2rem]"
          aria-label={person.name}
        >
          {NAME_WORDS.map((word, wi) => (
            <span key={word} className="flex whitespace-nowrap">
              {word.split("").map((ch, ci) => {
                const i = WORD_AT[wi] + ci;
                return (
                  <motion.span
                    key={i}
                    className="hw-ch inline-block"
                    initial={settled ? false : { opacity: 0, y: "34%", filter: "blur(20px)" }}
                    animate={settled ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.15, delay: live ? 0.35 + i * 0.055 : 0, ease: EASE }}
                  >
                    {i < HL ? <span className="text-amber">{ch}</span> : ch}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </h1>

        {/* the wordmark already says the full name — here only the role and the city */}
        <motion.div className="mt-8" {...up({ y: 14 }, 1.35, 0.7)}>
          <p className="text-xs uppercase tracking-[0.35em] text-bone/75">
            {person.role} &middot; {person.location}
          </p>
        </motion.div>

        {/* no invented tagline, no skill chips here — the resume sections start next chapter */}
        <motion.div className="mt-12 flex flex-wrap justify-center gap-4" {...up({ y: 16 }, 1.75, 0.6)}>
          <a
            href="#world"
            data-mag
            className="border border-amber px-5 py-2 text-sm text-amber transition-colors hover:bg-amber hover:text-graphite"
          >
            enter the world
          </a>
          <a
            href="#experience"
            data-mag
            className="border border-bone/20 px-5 py-2 text-sm text-bone/70 transition-colors hover:border-bone/50 hover:text-bone"
          >
            the record
          </a>
          <a
            href="/resume.pdf"
            download
            data-mag
            className="border border-bone/20 px-5 py-2 text-sm text-bone/70 transition-colors hover:border-amber hover:text-amber"
          >
            download r&eacute;sum&eacute;
          </a>
        </motion.div>
      </motion.div>

      {/* corner dot grids tick into place */}
      {[
        "left-6 top-24",
        "right-6 top-24",
        "left-6 bottom-24",
        "right-6 bottom-24",
      ].map((pos, q) => (
        <div aria-hidden key={pos} className={`pointer-events-none absolute grid grid-cols-3 gap-1.5 ${pos}`}>
          {Array.from({ length: 9 }).map((_, d) => (
            <motion.span
              key={d}
              className="h-1 w-1 rounded-full bg-bone/30"
              initial={settled || !live ? false : { opacity: 0, scale: 0 }}
              animate={settled ? undefined : live ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.4, delay: 2.3 + q * 0.05 + d * 0.04 }}
            />
          ))}
        </div>
      ))}

      {/* a falling light dash down a hairline — the cue to move, without saying a word */}
      <span aria-hidden className="scroll-line" />
    </section>
  );
}
