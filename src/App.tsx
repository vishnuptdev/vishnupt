import { useEffect, useState } from "react";
import { person, skillGroups, topSections } from "./content";
import Ambient from "./components/Ambient";
import Boot from "./components/Boot";
import CaseFiles from "./components/CaseFiles";
import Chrono from "./components/Chrono";
import CinematicHero from "./components/CinematicHero";
import CinemaHUD from "./components/CinemaHUD";
import CursorRig from "./components/CursorRig";
import ScrollRig from "./components/ScrollRig";
import Education from "./components/Education";
import Finale from "./components/Finale";
import Skills from "./components/Skills";
import Stage3D from "./components/Stage3D";
import World3D from "./components/World3D";

const MARQUEE = `${person.role} · ${skillGroups.map((g) => g.big).join(" · ")} · `;

const dxb = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default function App() {
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(() => dxb.format(new Date()));
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const id = setInterval(() => setTime(dxb.format(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  // scrollspy: the chapter holding the frame lights up in the bar
  useEffect(() => {
    if (!started) return;
    const ids = ["hero", ...topSections.map((s) => s.id)];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    let raf = 0;
    const probe = () => {
      raf = 0;
      const y = window.innerHeight * 0.4;
      let cur = ids[0];
      for (const el of els) if (el.getBoundingClientRect().top <= y) cur = el.id;
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(probe);
    };
    probe();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [started]);

  return (
    <div className="min-h-screen font-mono text-bone">
      <Boot onDone={() => setStarted(true)} />
      <a
        href="#world"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-amber focus:bg-graphite focus:px-3 focus:py-2 focus:text-xs focus:text-amber"
      >
        skip to content
      </a>

      <Stage3D />
      <Ambient />
      <CinemaHUD />
      <CursorRig />
      <ScrollRig />
      <div aria-hidden className="vignette" />
      <div aria-hidden className="grain" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-bone/10 bg-graphite/75 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 text-xs sm:px-6">
          <a
            href="#hero"
            className={`tracking-[0.2em] transition-colors duration-300 ${active === "hero" ? "text-amber" : "text-bone"}`}
          >
            V<span className="text-amber">·</span>P<span className="text-bone/40">T</span>
          </a>
          <nav aria-label="Chapters" className="hidden items-center gap-5 md:flex">
            {topSections.map((s, i) => {
              const on = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  data-mag
                  aria-current={on ? "true" : undefined}
                  className={`group relative flex items-baseline gap-1.5 pb-1.5 pt-1 transition-colors duration-300 ${
                    on ? "text-amber" : "text-bone/50 hover:text-bone"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`font-mono text-[9px] transition-colors duration-300 ${
                      on ? "text-amber" : "text-bone/30 group-hover:text-bone/50"
                    }`}
                  >
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.22em]">{s.label}</span>
                  <span
                    aria-hidden
                    className={`absolute bottom-0 left-0 h-px w-full origin-left bg-amber transition-transform duration-500 ${
                      on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              );
            })}
          </nav>
          <span className="hidden items-center gap-2 text-bone/40 sm:flex">
            <span aria-hidden className={`h-1 w-1 rounded-full ${active === "contact" ? "bg-amber" : "bg-teal"}`} />
            DXB {time}
          </span>
        </div>
        {/* phones: the chapter index becomes a swipeable strip under the bar */}
        <nav aria-label="Chapters" className="flex gap-4 overflow-x-auto px-4 pb-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {topSections.map((s, i) => {
            const on = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={on ? "true" : undefined}
                className={`flex shrink-0 items-baseline gap-1 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  on ? "text-amber" : "text-bone/45"
                }`}
              >
                <span aria-hidden className="font-mono text-[8px]">
                  {String(i + 2).padStart(2, "0")}
                </span>
                {s.label}
              </a>
            );
          })}
        </nav>
      </header>

      <main className="relative z-10">
        <CinematicHero start={started} />
        {/* infinite marquee: the stack drifts sideways forever between cold open and the
            brief — background motion that never rests, two identical halves, seamless loop */}
        <div aria-hidden className="marquee-band">
          <div className="marquee-track font-display">
            <span>{MARQUEE}</span>
            <span>{MARQUEE}</span>
          </div>
        </div>
        <World3D />

        {/* the corridor keeps running behind every chapter — one continuous take, no set changes */}
        {/* resume order, one chapter per section: summary → skills → experience → projects → contact */}
        <div className="relative">
          <Skills />
          <Chrono />
          <CaseFiles />
          <Education />
          <Finale />
        </div>
      </main>
    </div>
  );
}
