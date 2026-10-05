import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// The cinema furniture: letterbox bars, a scene slate that names the chapter you are in, and
// a one-frame black punch when the film cuts from one scene to the next. Nothing else — it
// must read as film, not as chrome.

const SCENES = [
  { id: "hero", label: "01 · cold open" },
  { id: "world", label: "02 · the brief" },
  { id: "skills", label: "03 · stack" },
  { id: "experience", label: "04 · commits" },
  { id: "cases", label: "05 · side quests" },
  { id: "education", label: "06 · roots" },
  { id: "contact", label: "07 · ping" },
];

export default function CinemaHUD() {
  const [label, setLabel] = useState("");
  const [cut, setCut] = useState(0);
  const prev = useRef("");
  const reelRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const cutTopRef = useRef<HTMLSpanElement>(null);
  const cutBotRef = useRef<HTMLSpanElement>(null);
  const wipeRef = useRef<HTMLSpanElement>(null);
  const lastCut = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.innerHeight * 0.55;
      let cur = SCENES[0];
      for (const s of SCENES) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) cur = s;
      }
      if (prev.current && prev.current !== cur.id && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // throttled: a fast flick across several chapters must not machine-gun the slam —
        // one cut effect at a time, at least 1.2s apart, and it plays slow enough to watch
        const now = performance.now();
        if (now - lastCut.current > 1200) {
          lastCut.current = now;
          setCut((k) => k + 1);
          // the black punch and the corridor warp fire together: cut = camera lunge
          window.dispatchEvent(new Event("cine:warp"));
          // gsap: the letterbox halves close over the cut while an amber/teal light wipe
          // rakes across, then the new chapter is revealed — a deliberate cut, not a glitch
          const t = cutTopRef.current;
          const b = cutBotRef.current;
          const w = wipeRef.current;
          if (t && b && w) {
            gsap.timeline()
              .fromTo([t, b], { scaleY: 0 }, { scaleY: 1, duration: 0.28, ease: "power2.in" }, 0)
              .fromTo(w, { x: "-45vw" }, { x: "115vw", duration: 0.9, ease: "power2.inOut" }, 0.1)
              .to([t, b], { scaleY: 0, duration: 0.7, ease: "power2.out" }, 0.55);
          }
        }
      }
      prev.current = cur.id;
      setLabel((p) => (p === cur.label ? p : cur.label));
      // reel progress: how much of the film has run
      const room = document.documentElement.scrollHeight - window.innerHeight;
      if (reelRef.current) reelRef.current.style.width = `${(room > 4 ? (window.scrollY / room) * 100 : 0).toFixed(2)}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // the cursor is a light source: a warm spotlight rides the pointer over the whole film
    const spot = spotRef.current;
    let sx = window.innerWidth / 2;
    let sy = window.innerHeight / 2;
    const canSpot =
      spot && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(pointer: fine)").matches;
    // damped pointer axes on :root — every .bank/.tilt/.dp layer in the film consumes them
    const root = document.documentElement;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let praf = 0;
    const pump = () => {
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      root.style.setProperty("--mx", cx.toFixed(4));
      root.style.setProperty("--my", cy.toFixed(4));
      praf =
        Math.abs(tx - cx) > 0.0015 || Math.abs(ty - cy) > 0.0015 ? requestAnimationFrame(pump) : 0;
    };
    const onPtr = (e: PointerEvent) => {
      if (!canSpot || !spot) return;
      sx = e.clientX;
      sy = e.clientY;
      spot.style.transform = `translate3d(${sx.toFixed(0)}px, ${sy.toFixed(0)}px, 0)`;
      tx = (sx / window.innerWidth) * 2 - 1;
      ty = (sy / window.innerHeight) * 2 - 1;
      if (!praf) praf = requestAnimationFrame(pump);
    };
    if (canSpot) window.addEventListener("pointermove", onPtr, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPtr);
      if (praf) cancelAnimationFrame(praf);
    };
  }, []);

  return (
    <>
      <div aria-hidden className="cine-bar top" />
      <div aria-hidden className="cine-bar bottom" />
      <div aria-hidden ref={reelRef} className="reel-bar" />
      <div aria-hidden ref={spotRef} className="spot" />
      {cut > 0 && <div key={cut} aria-hidden className="cine-cut" />}
      <div aria-hidden className="cut-rig">
        <span ref={cutTopRef} className="cut-bar top" />
        <span ref={cutBotRef} className="cut-bar bot" />
        <span ref={wipeRef} className="cut-wipe" />
      </div>
      <p className={`cine-caption ${label ? "is-on" : ""}`} aria-live="polite">
        {label}
      </p>
    </>
  );
}
