import { useEffect, useRef, useState } from "react";

// Boot gate — the page sits on TRUE black until fonts are ready, then holds the darkness a
// beat longer (a reveal fired too early reads as a glitch, not as cinema). The veil lifts,
// the scroll lock is released IN THE SAME STEP, and the hero's clock starts on the lift.
export default function Boot({ onDone }: { onDone: () => void }) {
  const cb = useRef(onDone);
  cb.current = onDone;
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-booting");
    const startedAt = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, 700 - (performance.now() - startedAt)); // the black must be felt
      window.setTimeout(() => {
        root.classList.remove("is-booting"); // release the lock here — never in an unmount cleanup
        setFading(true);
        cb.current();
        window.setTimeout(() => setGone(true), 750);
      }, wait);
    };
    (document.fonts?.ready ?? Promise.resolve()).then(finish);
    const guard = window.setTimeout(finish, 2500); // never trap the visitor behind a stalled font
    return () => clearTimeout(guard);
  }, []);

  if (gone) return null;
  return (
    <div aria-hidden className={`boot-veil ${fading ? "is-fading" : ""}`}>
      <span className="boot-bar" />
    </div>
  );
}
