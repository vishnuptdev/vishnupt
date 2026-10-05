import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { animate, stagger } from "animejs";
import Portrait from "./Portrait";
import { person } from "../content";

// Chapter 1 — the opening. Veil lifts → welcome strip → the wordmark materialises centre-out
// (letters resolve around the middle, so the type grows around nothing where a body would
// stand) → name line → chips snap in from the flanks → corner dots tick → CTAs.
// Beats overlap on purpose: a queue of fades reads as UI, overlapping beats read as cinema.
// All entrances are TIME-based (never scroll-based) so flicks can't skip or smear the moment.

const WORD = "VISHNU".split("");
// reveal rank: centre letters first, outward
const RANK = WORD.map((_, i) => Math.abs(i - (WORD.length - 1) / 2));
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
    const spans = [...h1.querySelectorAll<HTMLSpanElement>(":scope > span")];
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
    const spans = [...h1.querySelectorAll<HTMLElement>(":scope > span")];
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

        <h1 ref={wordRef} className="hero-word mt-6 flex font-display text-[19vw] leading-[0.85] sm:text-[14vw] lg:text-[11rem]" aria-label="Vishnu">
          {WORD.map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={settled ? false : { opacity: 0, y: "34%", filter: "blur(20px)" }}
              animate={settled ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.15, delay: live ? 0.35 + RANK[i] * 0.22 : 0, ease: EASE }}
            >
              {i === 4 ? <span className="text-amber">N</span> : ch}
            </motion.span>
          ))}
        </h1>

        {/* the operator stands beside his own name: pixel-resolve entrance, duotone glass,
            scan sweep forever, slow Ken Burns breath — the face opens the film */}
        <motion.div
          className="mt-8 flex flex-col items-center gap-6 md:flex-row md:gap-9"
          {...up({ y: 14 }, 1.35, 0.7)}
        >
          <div className="portrait tilt w-32 shrink-0 sm:w-40">
            <Portrait className="portrait-cv block aspect-[4/5] w-full" />
            <span aria-hidden className="tint" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-bone/75">{person.name}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-bone/50">
              {person.role} &middot; {person.location}
            </p>
          </div>
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
