import { useEffect, useRef } from "react";
import gsap from "gsap";
import { projects, type Project } from "../content";
import CorbzyDemo from "./CorbzyDemo";

// Chapter 5 — the side reel, on its own machine: a horizontal filmstrip. Vertical scroll drives
// a sideways dolly across four dossiers lined up in a row; the focused file scales up and its
// case stamp slams, an amber dot rides the progress rail below. Nothing here crossfades — the
// camera pans. Deep links still work: the scroll room carries an invisible anchor spine.
// Phones/reduced: the same dossiers, plain flow.

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function Line({ kicker, text }: { kicker: string; text: string }) {
  const todo = text.startsWith("[TODO");
  return (
    <div className="border-t border-bone/10 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-bone/45">{kicker}</p>
      <p className={`mt-1 text-[11px] leading-relaxed sm:text-xs ${todo ? "text-amber" : "text-bone/80"}`}>{text}</p>
    </div>
  );
}

function Body({ p, n }: { p: Project; n: number }) {
  return (
    <div className="grid w-full gap-8 text-left md:grid-cols-[1fr_1.1fr] md:gap-10">
      <div>
        <p className="stamp font-mono text-[11px] text-bone/45">
          case {String(n).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} &middot;{" "}
          <span className="text-teal">{p.kind}</span>
        </p>
        <h3 className="mt-2 font-display text-5xl leading-[0.9] sm:text-6xl">{p.name}</h3>
        <p className="mt-4 max-w-sm text-xs leading-relaxed text-bone/60">{p.summary}</p>
        {p.url && (
          <a href={p.url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs text-amber hover:underline">
            {p.url}
          </a>
        )}
        {p.repo &&
          (p.repo.startsWith("[TODO") ? (
            <p className="mt-2 text-xs text-amber">{p.repo}</p>
          ) : (
            <a href={p.repo} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-amber hover:underline">
              repo
            </a>
          ))}
        <p className="mt-5 flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <span
              key={s}
              className={s.startsWith("[TODO") ? "text-xs text-amber" : "border border-bone/20 px-1.5 py-0.5 text-[10px] text-bone/60"}
            >
              {s}
            </span>
          ))}
        </p>
      </div>
      <div>
        <Line kicker="problem" text={p.problem} />
        <Line kicker="design" text={p.design} />
        <Line kicker="outcome" text={p.outcome} />
        {p.slug === "corbzy" && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-bone/45">
              live demo — runs in your browser, nothing stored
            </p>
            <div className="mt-2">
              <CorbzyDemo />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CaseFiles() {
  const secRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = secRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track) return;
    const cards = [...track.querySelectorAll<HTMLElement>("[data-case]")];
    const dot = dotRef.current;

    const flat =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 767px)").matches;
    if (flat) {
      pin.style.position = "static";
      pin.style.height = "auto";
      section.querySelectorAll<HTMLElement>("[data-spine]").forEach((el) => (el.style.display = "none"));
      cards.forEach((el) => el.classList.add("is-on"));
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
      sp += (target - sp) * 0.12;
      // vertical scroll becomes sideways travel: the strip pans, nothing fades
      const span = Math.max(0, track.scrollWidth - window.innerWidth);
      const x = sp * span;
      track.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)`;
      // pure pan, everything always sharp: the held dossier just takes the amber frame
      const mid = window.innerWidth / 2;
      cards.forEach((el) => {
        const c = el.offsetLeft + el.offsetWidth / 2 - x;
        const d = Math.abs(c - mid) / window.innerWidth;
        el.classList.toggle("is-on", clamp01(1 - d * 2.2) > 0.55);
      });
      if (dot) dot.style.left = `${(sp * 100).toFixed(2)}%`;
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
      { threshold: 0.01 }
    );
    io.observe(section);
    // gsap: the reel loads like physical cards dealt onto the table — each dossier swings
    // in off a 76° Y-rotation, 130ms apart, once. The strip itself keeps owning X travel.
    const io2 = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io2.disconnect();
        gsap.fromTo(
          cards.map((c) => c.firstElementChild),
          { rotationY: 76, opacity: 0, transformOrigin: "left center" },
          { rotationY: 0, opacity: 1, duration: 1.05, stagger: 0.13, ease: "power3.out" }
        );
      },
      { threshold: 0.2 }
    );
    io2.observe(section);
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
      id="cases"
      ref={secRef}
      aria-label="Personal projects"
      className="relative h-[420svh] scroll-mt-20"
    >
      {/* invisible anchor spine — native in-page links land where that file is centred.
          offset = i/(n-1) * (420svh - 100svh) */}
      {projects.map((p, i) => (
        <span
          key={p.slug}
          id={`case-${p.slug}`}
          aria-hidden
          data-spine
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: `calc(${((i / (projects.length - 1)) * 320).toFixed(1)}vh + 2px)` }}
        />
      ))}
      <div ref={pinRef} className="tilt-scene sticky top-0 h-screen overflow-hidden">
        <span aria-hidden className="sprockets top-8" />
        <span aria-hidden className="sprockets bottom-8" />
        <p className="absolute left-1/2 top-14 z-10 -translate-x-1/2 text-center text-[11px] uppercase tracking-[0.4em] text-bone/50">
          <span data-split>side quests — four builds shipped off the clock</span>
        </p>
        {/* projector light sits BEHIND the dossiers: cone and lamp pool read around the
            cards, never scratch across their text */}
        <span aria-hidden className="fx fx-flicker" />
        <div ref={trackRef} className="case-track">
          {projects.map((p, i) => (
            <article key={p.slug} data-case className="case-card">
              <Body p={p} n={i + 1} />
            </article>
          ))}
        </div>
        <div aria-hidden className="case-rail">
          {projects.map((p, i) => (
            <span
              key={p.slug}
              className="case-rail-tick"
              style={{ left: `${((i / (projects.length - 1)) * 100).toFixed(1)}%` }}
            />
          ))}
          <span ref={dotRef} className="case-rail-dot" style={{ left: "0%" }} />
        </div>
      </div>
    </section>
  );
}
