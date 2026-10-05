import { useEffect, useRef, type CSSProperties } from "react";
import { animate } from "animejs";
import { experience } from "../content";

// Chapter 4 — professional experience as a stack of slabs. No fades, no zoom: four full-screen
// panels pinned at the top of the frame, each rising over the one before on a DIAGONAL seam
// (clip-path wedge — never a straight scroll-cover). When a slab takes the frame: the year
// slams with a chromatic split, the title and org line DECODE out of random glyphs like a
// terminal handshake, the bullets walk in, the gate flickers; the ghost year drifts against
// the cover as depth parallax while the slab is held. Oldest first, toward HEAD.

const GLYPHS = "01#%&@/\\<>$*ABCDEFGHJKLMNPRSTUVWXZ";
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// time-based glyph scramble, locks left-to-right; original text cached in data-fin
function scramble(el: HTMLElement, dur = 620) {
  const fin = el.dataset.fin ?? (el.dataset.fin = el.textContent ?? "");
  const t0 = performance.now();
  const step = (now: number) => {
    const u = Math.min(1, (now - t0) / dur);
    const lock = Math.floor(u * fin.length);
    let s = "";
    for (let i = 0; i < fin.length; i++)
      s += i < lock || fin[i] === " " ? fin[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    el.textContent = s;
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// the year poster is an odometer: every digit is a column of 0-9 that rolls into place
// when the slab takes the frame — mechanical, staggered, never a plain fade-in number
function Odo({ v }: { v: string }) {
  return (
    <>
      {v.split("").map((ch, i) => {
        const d = Number(ch);
        if (ch.trim() === "" || !Number.isInteger(d)) return <span key={i}>{ch}</span>;
        return (
          <span key={i} className="odo">
            <span className="odo-col" style={{ "--d": d, "--s": (d + 5) % 10, "--i": i } as CSSProperties}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        );
      })}
    </>
  );
}

export default function Chrono() {
  const secRef = useRef<HTMLElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = secRef.current;
    if (!section) return;
    const panels = [...section.querySelectorAll<HTMLElement>(".exp-panel")];
    const ghosts = panels.map((p) => p.querySelector<HTMLElement>(".exp-ghost"));
    const years = dialRef.current ? [...dialRef.current.querySelectorAll("span")] : [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          const el = e.target as HTMLElement;
          const on = e.intersectionRatio > 0.45;
          const was = el.classList.contains("is-on");
          el.classList.toggle("is-on", on);
          if (on) {
            const idx = panels.indexOf(el);
            if (dialRef.current) {
              // the dial elevators to the year of the slab holding the frame
              dialRef.current.style.transform = `translateY(${(1 - idx) * 32}px)`;
              years.forEach((s, i) => s.classList.toggle("act", i === idx));
            }
            if (!was && !reduced) {
              // decode the title + org out of glyphs the moment the slab lands
              const t = el.querySelector<HTMLElement>("h3");
              const o = el.querySelector<HTMLElement>(".exp-org");
              if (t) scramble(t, 700);
              if (o) scramble(o, 850);
              // anime.js: the role title settles — from 1.45× and a soft blur, easing in slow
              // while the glyphs decode underneath. Big type, but readable the whole way down.
              if (t)
                animate(t, {
                  scale: [1.28, 1],
                  filter: ["blur(8px)", "blur(0px)"],
                  duration: 900,
                  ease: "outCubic",
                });
            }
          }
        });
      },
      { threshold: [0, 0.45, 0.8] }
    );
    panels.forEach((p) => io.observe(p));

    // ghost-year parallax: while the next slab rises to cover, this slab's ghost drifts
    // up against it — the held frame stays alive, depth between the layers
    let raf = 0;
    const drift = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (let i = 0; i < panels.length - 1; i++) {
        const g = ghosts[i];
        if (!g) continue;
        const cov = clamp01(1 - panels[i + 1].getBoundingClientRect().top / vh);
        g.style.transform = `translateY(calc(-50% - ${(cov * 13).toFixed(2)}vh))`;
      }
    };
    const onScroll = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(drift);
    };
    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="experience" ref={secRef} aria-label="Professional experience" className="relative scroll-mt-20">
      {/* the year dial: a sticky elevator at the right edge, riding the whole chapter */}
      <div aria-hidden className="exp-dial-wrap">
        <div className="exp-dial">
          <div ref={dialRef} className="exp-dial-col">
            {experience.map((e) => (
              <span key={e.from}>{e.from}–{e.to}</span>
            ))}
          </div>
        </div>
      </div>
      {experience.map((e, i) => (
        <div key={`${e.from}-${e.org}`} className={`exp-panel exp-panel-${i + 1}`}>
          <span aria-hidden className="fx fx-rings" />
          <span aria-hidden className="exp-sweep" />
          <span aria-hidden className="exp-ghost">
            {e.from}
          </span>
          <div className="exp-scrub relative">
          <div className="bank mx-auto grid min-h-svh w-full max-w-6xl gap-8 px-6 py-24 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center md:gap-14">
            <div className="exp-l">
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-bone/55">
                role 0{i + 1} / 0{experience.length} &middot; {e.location}
              </p>
              <p className={`yr mt-2 font-display leading-[0.8] text-[22vw] sm:text-[10vw] lg:text-[9rem] ${e.to === "Present" ? "text-amber" : "text-bone"}`}>
                <span className="sr-only">{e.from}</span>
                <span aria-hidden>
                  <Odo v={e.from} />
                </span>
              </p>
              <h3 className="mt-4 font-display text-3xl sm:text-4xl">{e.title}</h3>
              <p className="exp-org mt-2 text-[11px] uppercase tracking-[0.3em] text-teal">
                {e.org} &middot; {e.from} – {e.to}
              </p>
            </div>
            <ul className="exp-r space-y-3 border-l border-bone/10 pl-6">
              {e.bullets.map((b) => (
                <li key={b} className="xb grid grid-cols-[auto_1fr] gap-x-3 text-[11px] leading-relaxed text-bone/75 sm:text-sm">
                  <span aria-hidden className="text-amber">
                    ▪
                  </span>
                  <span className="xbm">
                    <span className="xbi">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>
      ))}
    </section>
  );
}
