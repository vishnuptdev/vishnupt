import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { animate, stagger } from "animejs";
import ContactForm from "./ContactForm";
import { contact, person } from "../content";

// The closing shot — its own grammar, not another centered card. An ember room wakes, giant
// type surfaces through drifting fog, and the contact routes hang as poster-scale credit rows
// that slide amber on hover. Then frame two: the whole screen is replaced by a sliding panel
// carrying the functional layer — the form, the next steps, the education credits — like the
// end card of a film after the poster has had its moment.

const TITLE = "LET'S BUILD".split("");

const ROWS = [
  { k: "email", v: contact.email, href: `mailto:${contact.email}`, ext: false },
  { k: "github", v: contact.github.replace("https://", ""), href: contact.github, ext: true },
  { k: "linkedin", v: contact.linkedin.replace("https://", ""), href: contact.linkedin, ext: true },
];

function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    const size = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);
    const pts = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.7,
      v: 0.008 + Math.random() * 0.022,
      s: Math.random() * 6.28,
    }));
    let running = false;
    let raf = 0;
    const draw = (now: number) => {
      if (!running) return;
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.y -= p.v / 60;
        if (p.y < -0.02) p.y = 1.02;
        const x = (p.x + Math.sin(t * 0.3 + p.s) * 0.012) * w;
        const y = p.y * h;
        const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.8 + p.s));
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(255,176,32,${a.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver((es) => {
      running = es[0].isIntersecting;
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    });
    io.observe(cv);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", size);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-50" />;
}

export default function Finale() {
  const reduced = useReducedMotion();
  const secRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  // credit rows wipe in on a time-based stagger the first time the room is seen
  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const f1 = sec.querySelector(".fin-f1");
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          f1?.classList.add("is-lit");
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  // anime.js: the credit rows are the closing titles — they slide in off-frame right on a
  // stagger the first time the room lights, 160ms apart. Time-based, once, no scrub.
  useEffect(() => {
    const sec = secRef.current;
    if (!sec || reduced) return;
    const rows = Array.from(sec.querySelectorAll<HTMLElement>(".fin-row"));
    rows.forEach((r) => (r.style.opacity = "0"));
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        animate(rows, {
          translateX: [80, 0],
          opacity: [0, 1],
          duration: 1000,
          delay: stagger(130),
          ease: "outExpo",
        });
      },
      { threshold: 0.35 }
    );
    io.observe(sec);
    return () => io.disconnect();
  }, [reduced]);

  // frame two: the last quarter of the scroll slides the end card over the poster frame
  useEffect(() => {
    const sec = secRef.current;
    const pin = pinRef.current;
    if (!sec || !pin || reduced) return;
    const f2 = pin.querySelector(".fin-f2");
    const onScroll = () => {
      const room = sec.offsetHeight - window.innerHeight;
      const sp = room > 4 ? Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / room)) : 0;
      const raw = Math.min(1, Math.max(0, (sp - 0.5) / 0.35));
      const p = raw * raw * (3 - 2 * raw);
      pin.style.setProperty("--p", p.toFixed(3));
      pin.classList.toggle("is-f2", p > 0.5);
      // parked off-frame, the second panel must stay out of the tab order
      f2?.toggleAttribute("inert", p < 0.3 && window.innerWidth >= 768);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  return (
    <section id="contact" ref={secRef} aria-label="Contact" className="finale relative h-[200svh] scroll-mt-20">
      <div ref={pinRef} className="sticky top-0 h-screen overflow-hidden">
        <Embers />
        <span aria-hidden className="fog fog-a" />
        <span aria-hidden className="fog fog-b" />

        {/* frame one — the poster: giant type over ember fog, contact routes as credit rows */}
        <div className="fin-f1 relative z-10 flex h-full flex-col justify-between px-4 pb-10 pt-24 sm:px-6">
          <p data-split className="relative z-10 text-center text-[11px] uppercase tracking-[0.45em] text-bone/55">
            end of trace — your move
          </p>

          {/* gsap scrubs this wrapper: as the pin burns toward frame two the giant type
              zooms past the camera and dies — the poster shot ends like a cut, not a fade */}
          <div className="type-scrub md:absolute md:inset-0">
            <h2
              aria-hidden
              className="finale-type dp font-display leading-[0.85]"
              style={{ "--dx": "7px", "--dy": "5px" } as CSSProperties}
            >
              {TITLE.map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block whitespace-pre"
                  initial={reduced ? false : { opacity: 0, y: "30%", filter: "blur(14px)" }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 1.1, delay: i * 0.055, ease: [0.16, 1, 0.3, 1] }}
                >
                  {i >= 6 ? <span className="text-amber">{ch}</span> : ch}
                </motion.span>
              ))}
            </h2>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-end gap-8 pb-2">
            <div className="w-full max-w-3xl bg-[rgb(10_11_14_/_0.62)] px-4 py-3 backdrop-blur-[2px] sm:px-8">
            {ROWS.map((r, i) => (
              <a
                key={r.k}
                href={r.href}
                {...(r.ext ? { target: "_blank", rel: "noreferrer" } : {})}
                className={`fin-row grid grid-cols-1 items-baseline gap-1 px-2 py-3 text-left sm:grid-cols-[130px_1fr] sm:gap-6 sm:py-4 ${
                  i === ROWS.length - 1 ? "border-b border-bone/10" : ""
                } border-t border-bone/10`}
              >
                <span className="text-[10px] uppercase tracking-[0.3em] text-bone/45">{r.k}</span>
                <span className="fin-val font-display text-xl leading-tight text-bone/85 break-all sm:text-3xl">
                  {r.v}
                </span>
              </a>
            ))}
            </div>
          </div>
        </div>

        {/* frame two — the end card: form, next steps, education credits. Its own sky:
            a sonar sweep over range rings — chapter 07 is called ping, so the room pings. */}
        <div className="fin-f2 absolute inset-0 z-20 overflow-y-auto">
          <span aria-hidden className="fx fx-radar" />
          <div className="relative mx-auto grid min-h-full w-full max-w-5xl content-center gap-10 px-8 py-10 md:grid-cols-[1fr_1.05fr] md:gap-14 sm:px-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.45em] text-bone/55">what happens next</p>
              <ol className="mt-6 space-y-5">
                {[
                  ["01", "read the room", "summary, skills, four cuts, four builds — all dated, all real."],
                  ["02", "send the brief", "POST /contact, or mail — either route reaches the same inbox."],
                  ["03", "we talk backend", "architecture, pipelines, LLM infra — bring the hard part first."],
                ].map(([n, h, s]) => (
                  <li key={n} className="grid grid-cols-[auto_1fr] gap-x-5">
                    <span className="font-mono text-xs text-amber">{n}</span>
                    <span>
                      <span className="block font-display text-2xl">{h}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-bone/55">{s}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <a
                href="/resume.pdf"
                download
                className="mt-8 inline-block border border-bone/20 px-4 py-2 text-xs text-bone/70 transition-colors hover:border-amber hover:text-amber"
              >
                download r&eacute;sum&eacute; (pdf)
              </a>
              <p className="mt-6 text-[11px] text-bone/40">
                {person.name} &middot; {person.location} &middot; {new Date().getFullYear()}
              </p>
            </div>
            <ContactForm compact />
          </div>
        </div>
      </div>
    </section>
  );
}
