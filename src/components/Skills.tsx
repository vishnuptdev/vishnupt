import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { skillGroups } from "../content";

// Chapter 3 — the armory, as a terminal. Not cards, not fades: a log file typing itself out.
// Scroll sets HOW FAR the log may type; a time-based ticker prints tokens at a constant speed,
// so lines appear instantly under a blinking caret the way output actually lands in a shell.
// Five groups, verbatim, in resume order. Phones/reduced: the whole log, already printed.

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// code rain: 26 glyph columns, each a doubled strip falling on its own clock — the terminal
// sits in a live downpour of its own language. Seamless loop (height 200%, -50% → 0).
const RAIN_GLYPHS = "01{}[]<>/=;*$#&@abcdefxuinit";
function Rain() {
  const cols = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const half = Array.from({ length: 26 }, () => RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0]).join("\n");
        return {
          left: (i / 34) * 100 + Math.random() * 1.5,
          dur: 9 + Math.random() * 11,
          delay: -Math.random() * 20,
          txt: `${half}\n${half}`,
        };
      }),
    []
  );
  return (
    <span aria-hidden className="fx fx-rain">
      {cols.map((c, i) => (
        <span key={i} style={{ left: `${c.left}%`, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
          {c.txt}
        </span>
      ))}
    </span>
  );
}

// sequential token index: each group head, then its chips
const TOKENS: { kind: "head" | "chip"; group: number; text: string }[] = [];
skillGroups.forEach((g, gi) => {
  TOKENS.push({ kind: "head", group: gi, text: g.big });
  g.chips.forEach((c) => TOKENS.push({ kind: "chip", group: gi, text: c }));
});
const TOTAL = TOKENS.length;

export default function Skills() {
  const reduced = useReducedMotion();
  // code rain is desktop eye-candy: 34 animated columns are wasted frames on a phone
  const [phone] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const secRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const cntRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = secRef.current;
    const pin = pinRef.current;
    const body = bodyRef.current;
    if (!section || !pin || !body) return;
    const toks = [...body.querySelectorAll<HTMLElement>("[data-tok]")];

    const flat =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 767px)").matches;
    if (flat) {
      // phone/reduced: no pin, no 520svh scroll room, no clipping — the whole log is
      // already printed and the section hugs its content
      pin.style.position = "static";
      pin.style.height = "auto";
      pin.style.minHeight = "100svh";
      section.style.height = "auto";
      body.style.maxHeight = "none";
      body.style.overflow = "visible";
      toks.forEach((el) => el.classList.add("on"));
      if (barRef.current) barRef.current.style.width = "100%";
      if (cntRef.current) cntRef.current.textContent = `${TOTAL}/${TOTAL}`;
      return;
    }

    let shown = 0;
    let sp = 0;
    let running = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const room = section.offsetHeight - window.innerHeight;
      const target = room > 4 ? clamp01(-section.getBoundingClientRect().top / room) : 0;
      sp += (target - sp) * 0.1;
      // the ticker prints at a constant speed toward wherever the scroll has reached
      const goal = sp * TOTAL;
      shown = Math.min(goal, shown + dt * 16);
      const cur = Math.floor(shown);
      toks.forEach((el, i) => {
        el.classList.toggle("on", i < shown);
        el.classList.toggle("cur", i === cur && cur < TOTAL);
      });
      // status line: how much of the log has printed
      if (barRef.current) barRef.current.style.width = `${((shown / TOTAL) * 100).toFixed(1)}%`;
      if (cntRef.current) cntRef.current.textContent = `${Math.min(TOTAL, Math.floor(shown))}/${TOTAL}`;
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(
      (es) => {
        visible = es[0].isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0.02 }
    );
    io.observe(section);
    // gsap: the terminal DROPS into the room — hinged at its top edge, swinging down from
    // -72° like a shutter falling into place, once, the first time the chapter is entered
    const drop = dropRef.current;
    if (drop) {
      const io2 = new IntersectionObserver(
        (es) => {
          if (!es[0].isIntersecting) return;
          io2.disconnect();
          gsap.fromTo(
            drop,
            { rotationX: -72, y: -140, opacity: 0, transformOrigin: "50% 0%" },
            { rotationX: 0, y: 0, opacity: 1, duration: 1.15, ease: "power4.out" }
          );
        },
        { threshold: 0.25 }
      );
      io2.observe(section);
    }
    const onVis = () => {
      if (document.visibilityState === "hidden") stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  let ti = -1;
  return (
    <section id="skills" ref={secRef} aria-label="Core skills" className="relative h-[520svh] scroll-mt-20">
      <div ref={pinRef} className="tilt-scene sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4">
        {!reduced && !phone && <Rain />}
        <div ref={dropRef} className="tilt-scene relative z-10 w-full max-w-3xl">
        <div className="crt tilt w-full border border-bone/12 bg-[rgb(8_9_12_/_0.66)] shadow-[0_40px_120px_-40px_rgb(0_0_0/_0.9)] backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-bone/10 px-4 py-2.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[rgb(255_95_86)]" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[rgb(255_189_46)]" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[rgb(39_201_63)]" />
            <p className="ml-3 text-[11px] tracking-[0.2em] text-bone/50">
              vishnu@control-room:~$ cat skills.log — five groups, straight from the resume
            </p>
          </div>
          <div ref={bodyRef} className="max-h-[62svh] overflow-hidden px-5 py-5 sm:px-7 sm:py-6">
            {skillGroups.map((g) => (
              <div key={g.big} className="mb-5 last:mb-0">
                <p
                  data-tok={++ti}
                  className="tk-head text-[11px] uppercase tracking-[0.3em] text-teal"
                >
                  ▸ {g.big}
                </p>
                <p className="mt-2.5 flex flex-wrap gap-2">
                  {g.chips.map((c) => (
                    <span
                      key={c}
                      data-tok={++ti}
                      className="tk border border-bone/25 px-3 py-1.5 text-[11px] text-bone/75"
                    >
                      {c}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 border-t border-bone/10 px-4 py-2">
            <span className="h-px flex-1 bg-bone/15">
              <span ref={barRef} className="block h-full bg-teal" style={{ width: "0%" }} />
            </span>
            <span ref={cntRef} className="font-mono text-[10px] tracking-[0.2em] text-bone/45">
              0/{TOTAL}
            </span>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
