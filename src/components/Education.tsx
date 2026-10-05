import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { animate } from "animejs";
import { education } from "../content";

// Chapter 6 — education as an airport split-flap departures board. No static credits card,
// no fades: every letter is a physical flap that cycles the alphabet and clacks into place,
// row by row, left to right, once — pure time-based mechanics, like the rest of the film.
// The degree departs first, the college follows, the years land last in amber.
// Reduced motion / phones: the board is already settled, full text always in the DOM.

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—";

function Cell({ ch, delay, run, quiet }: { ch: string; delay: number; run: boolean; quiet: boolean }) {
  const [c, setC] = useState(" ");
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // anime.js: the flap clacks — a single back-eased scale punch the instant it locks
  useEffect(() => {
    if (done && !quiet && ref.current)
      animate(ref.current, { scale: [1.24, 1], duration: 340, ease: "outBack" });
  }, [done, quiet]);

  useEffect(() => {
    if (!run || ch === " ") {
      setC(ch === " " ? " " : ch);
      setDone(true);
      return;
    }
    let t = 0;
    setC(GLYPHS[(Math.random() * GLYPHS.length) | 0]);
    const iv = setInterval(() => {
      t += 32;
      if (t >= delay + 300) {
        setC(ch);
        setDone(true);
        clearInterval(iv);
      } else {
        setC(GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      }
    }, 32);
    return () => clearInterval(iv);
  }, [run, ch, delay]);

  return (
    <span ref={ref} className={`flap-cell${done ? " lk" : ""}`}>
      {c}
    </span>
  );
}

export default function Education() {
  const reduced = useReducedMotion();
  const secRef = useRef<HTMLElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = secRef.current;
    if (!el || reduced) {
      setRun(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const rows = [
    { text: education.degree.toUpperCase(), cls: "text-sm sm:text-xl", d0: 250 },
    { text: `${education.college} — ${education.place}`.toUpperCase(), cls: "text-[10px] sm:text-sm", d0: 1100 },
    { text: education.years, cls: "flap-amber pt-3 text-base sm:text-2xl", d0: 2100 },
  ];

  // words are atomic: the board wraps BETWEEN words, never splits one across lines
  const words = (text: string) => {
    const out: { w: string; start: number }[] = [];
    let p = 0;
    for (const w of text.split(" ")) {
      out.push({ w, start: p });
      p += w.length + 1;
    }
    return out;
  };

  return (
    <section
      id="education"
      ref={secRef}
      aria-label="Education"
      className="relative flex min-h-svh scroll-mt-20 items-center justify-center px-4"
    >
      {/* departures, literally: dashed flight paths drift across the board's sky, three
          routes at three speeds, destination nodes blinking — no circles, no clockwork */}
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
        <p data-split className="text-[11px] uppercase tracking-[0.45em] text-bone/55">
          roots — the departures board
        </p>
        <h2 className="sr-only">
          {education.degree}, {education.college}, {education.place}, {education.years}
        </h2>
        <div aria-hidden className="mt-10 space-y-3">
          {rows.map((r, ri) => (
            <div key={ri} className={`flap-row ${r.cls}`}>
              {words(r.text).map(({ w, start }) => (
                <span key={start} className="flap-word">
                  {w.split("").map((ch, i) => (
                    <Cell key={i} ch={ch} delay={r.d0 + (start + i) * 45} run={run} quiet={!!reduced} />
                  ))}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
