import { useEffect, useRef } from "react";
import { summaryLines } from "../content";

// Chapter 2 — professional summary, verbatim. The corridor itself is Stage3D: one fixed canvas
// behind the whole film, camera damped and never still. This section is the scroll room that
// pilots that camera at full burn; what lives here are the resume's own three sentences,
// centered low in the frame over a ghost numeral, crossfading with travel.

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function World3D() {
  const secRef = useRef<HTMLElement>(null);
  const capsRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = secRef.current;
    if (!section) return;
    const caps = capsRef.current
      ? [...capsRef.current.querySelectorAll<HTMLElement>("[data-cap]")]
      : [];
    const ghosts = caps.map((el) => el.querySelector<HTMLElement>(".ghost-num"));
    const pin = pinRef.current;

    const updCaps = (sp: number) => {
      const n = caps.length;
      caps.forEach((el, i) => {
        const c = (i + 0.5) / n;
        const u = clamp01(1 - Math.abs(sp - c) * n * 0.9);
        const o = u * u * (3 - 2 * u);
        el.style.opacity = o.toFixed(3);
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        // words decode on a time-based stagger once the caption window opens
        el.classList.toggle("is-on", o > 0.5);
        // the ghost numeral drifts slower than the caption — depth in the frame
        const g = ghosts[i];
        if (g) g.style.transform = `translate(-50%, calc(-58% + ${((sp - c) * 90).toFixed(1)}px))`;
      });
      // captions let go before the scene cuts out
      if (pin) {
        const q = clamp01((sp - 0.92) / 0.08);
        pin.style.opacity = (1 - q * q * (3 - 2 * q)).toFixed(3);
      }
    };

    const flat =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 767px)").matches;
    if (flat) {
      const pin = pinRef.current;
      if (pin) {
        pin.style.position = "static";
        pin.style.height = "auto";
      }
      caps.forEach((el) => {
        el.style.opacity = "1";
        el.classList.add("is-on");
      });
      return;
    }

    let sp = 0;
    let running = false;
    let visible = false;
    let raf = 0;
    const frame = () => {
      if (!running) return;
      const room = section.offsetHeight - window.innerHeight;
      const target = room > 4 ? clamp01(-section.getBoundingClientRect().top / room) : 0;
      sp += (target - sp) * 0.14; // travel reads damped even when the wheel ticks
      updCaps(sp);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
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

  return (
    <section
      id="world"
      ref={secRef}
      aria-label="Professional summary"
      className="relative h-[300svh] scroll-mt-20"
    >
      <div ref={pinRef} className="sticky top-0 h-screen overflow-hidden">
        <p className="absolute left-1/2 top-24 -translate-x-1/2 text-[11px] uppercase tracking-[0.35em] text-bone/55">
          professional summary — verbatim, read it while travelling
        </p>
        <div ref={capsRef} className="absolute inset-0">
          {summaryLines.map((line, i) => (
            <div
              key={i}
              data-cap={i}
              className="absolute inset-x-0 bottom-24 mx-auto max-w-3xl px-6 text-center opacity-0"
            >
              <span aria-hidden className="ghost-num">
                0{i + 1}
              </span>
              <p className="relative font-mono text-[11px] text-bone/55">
                <span className="text-amber">0{i + 1}</span> / 0{summaryLines.length}
              </p>
              <p className="relative mt-3 font-display text-2xl leading-[1.15] sm:text-3xl lg:text-4xl">
                {line.split(" ").map((w, wi) => (
                  <span key={wi} className="w-stag" style={{ transitionDelay: `${wi * 55}ms` }}>
                    {w}&nbsp;
                  </span>
                ))}
              </p>
              <span aria-hidden className="w-line mx-auto mt-5 block h-px w-44 bg-amber/60" />
              {i === summaryLines.length - 1 && (
                <a
                  href="#skills"
                  className="relative mt-5 inline-block border-b border-amber/60 pb-0.5 text-[11px] uppercase tracking-[0.25em] text-amber hover:border-amber"
                >
                  core skills ↓
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
