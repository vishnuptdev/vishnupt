import { useEffect, useRef } from "react";
import gsap from "gsap";

// The room is never dark-still: three huge colour orbs drift behind every chapter on
// infinite yoyo tweens (gsap), screen-blended over the corridor. Ambient background motion
// that runs the whole film — paused only for prefers-reduced-motion.

export default function Ambient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const orbs = ref.current?.querySelectorAll<HTMLElement>(".orb");
    if (!orbs?.length) return;
    const tweens = [...orbs].map((o, i) =>
      gsap.to(o, {
        xPercent: (i % 2 ? -1 : 1) * (18 + i * 9),
        yPercent: (i % 2 ? 1 : -1) * (14 + i * 7),
        duration: 16 + i * 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    );
    return () => tweens.forEach((t) => t.kill());
  }, []);

  return (
    <div aria-hidden ref={ref} className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <span
        className="orb"
        style={{
          width: "52vw",
          height: "52vw",
          left: "-12vw",
          top: "-14vh",
          background: "radial-gradient(circle, rgb(255 176 32 / .5), transparent 65%)",
        }}
      />
      <span
        className="orb"
        style={{
          width: "44vw",
          height: "44vw",
          right: "-10vw",
          top: "28vh",
          background: "radial-gradient(circle, rgb(61 214 198 / .4), transparent 65%)",
        }}
      />
      <span
        className="orb"
        style={{
          width: "60vw",
          height: "60vw",
          left: "18vw",
          bottom: "-30vh",
          background: "radial-gradient(circle, rgb(255 120 20 / .35), transparent 70%)",
        }}
      />
    </div>
  );
}
