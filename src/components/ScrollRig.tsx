import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAP ScrollTrigger rig — the scroll-scrubbed depth layer of the film:
//  - [data-split] kickers decode in as letter staggers the first time they enter frame
//  - experience slabs: while the next slab rises to cover, the held slab's content drifts
//    up against it (scrubbed, not timed) — parallax between cover and covered
//  - world captions drift through the frame at their own rate while the corridor travels
// Phones keep the letter staggers; the scrub parallax is a pinned-desktop grammar.

gsap.registerPlugin(ScrollTrigger);

export default function ScrollRig() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = window.matchMedia("(min-width: 768px)").matches;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        const text = el.textContent ?? "";
        el.setAttribute("aria-label", text);
        el.textContent = "";
        const spans = text.split("").map((ch) => {
          const s = document.createElement("span");
          s.className = "split-ch";
          s.setAttribute("aria-hidden", "true");
          s.textContent = ch === " " ? " " : ch;
          el.appendChild(s);
          return s;
        });
        gsap.fromTo(
          spans,
          { y: 16, opacity: 0, filter: "blur(6px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: 0.028,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
      });

      if (!wide) return;

      gsap.utils.toArray<HTMLElement>(".exp-scrub").forEach((wrap) => {
        gsap.to(wrap, {
          y: -90,
          ease: "none",
          scrollTrigger: { trigger: wrap.closest(".exp-panel"), start: "top top", end: "bottom top", scrub: true },
        });
      });
      // finale poster: the giant type rides the pin, then zooms past the lens and blacks out
      // as frame two takes the screen — scrubbed off the section's own 200svh pin
      gsap.utils.toArray<HTMLElement>(".type-scrub").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 1, opacity: 1 },
          {
            scale: 1.55,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") ?? el,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.5,
            },
          }
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-cap]").forEach((cap) => {
        gsap.fromTo(
          cap,
          { y: 70 },
          {
            y: -70,
            ease: "none",
            scrollTrigger: { trigger: cap.closest("section") ?? cap, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
