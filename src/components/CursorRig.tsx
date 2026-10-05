import { useEffect } from "react";

// Magnetic cursor: tagged [data-mag] elements lean toward the pointer inside their bounds
// (32% of the offset, damped 0.14) and spring home on leave — the interface has mass.
// No cursor repaints, no rings: the native pointer stays, the elements come to it.
// Coarse pointers / reduced motion: nothing binds.

export default function CursorRig() {
  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const st = [...document.querySelectorAll<HTMLElement>("[data-mag]")].map((el) => ({
      el,
      tx: 0,
      ty: 0,
      cx: 0,
      cy: 0,
    }));
    let raf = 0;
    const tick = () => {
      let live = false;
      for (const s of st) {
        s.cx += (s.tx - s.cx) * 0.14;
        s.cy += (s.ty - s.cy) * 0.14;
        if (Math.abs(s.tx - s.cx) > 0.05 || Math.abs(s.ty - s.cy) > 0.05) live = true;
        s.el.style.transform = `translate3d(${s.cx.toFixed(1)}px, ${s.cy.toFixed(1)}px, 0)`;
      }
      raf = live ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const binds = st.map((s) => {
      const onMove = (e: PointerEvent) => {
        const r = s.el.getBoundingClientRect();
        s.tx = (e.clientX - (r.left + r.width / 2)) * 0.32;
        s.ty = (e.clientY - (r.top + r.height / 2)) * 0.32;
        kick();
      };
      const onLeave = () => {
        s.tx = 0;
        s.ty = 0;
        kick();
      };
      s.el.addEventListener("pointermove", onMove);
      s.el.addEventListener("pointerleave", onLeave);
      return () => {
        s.el.removeEventListener("pointermove", onMove);
        s.el.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => {
      binds.forEach((u) => u());
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
