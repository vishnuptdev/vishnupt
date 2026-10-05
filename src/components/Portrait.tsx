import { useEffect, useRef } from "react";
import src from "../assets/portrait.jpg";

// The operator's face enters the film the way everything else does: alive, never a dead
// static jpeg. A canvas draws the portrait in coarse pixel blocks and resolves it block by
// block over ~2.2s the first time the frame sees it (time-based, once); scanlines and a
// travelling light band keep sweeping over the resolved face forever after.
// Reduced motion: drawn once at full resolution, sweeps frozen by the global kill switch.

const W = 640;
const H = 800;

export default function Portrait({ className }: { className?: string }) {
  const cvRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.width = W;
    cv.height = H;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const img = new Image();
    let raf = 0;
    let seen = false;
    let loaded = false;
    let began = false;

    // source frame stops at 88% height: the third-party burn-in watermark lives in the
    // bottom strip of the jpg and never enters the film, at any resolution
    const SH = () => img.naturalHeight * 0.88;
    const draw = (block: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;
      if (block <= 1) {
        ctx.drawImage(img, 0, 0, img.naturalWidth, SH(), 0, 0, W, H);
        return;
      }
      // shrink to a thumbnail, blow it back up with smoothing off = hard pixel mosaic
      const sw = Math.max(2, Math.floor(W / block));
      const sh = Math.max(2, Math.floor(H / block));
      const off = document.createElement("canvas");
      off.width = sw;
      off.height = sh;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.drawImage(img, 0, 0, img.naturalWidth, SH(), 0, 0, sw, sh);
      ctx.drawImage(off, 0, 0, sw, sh, 0, 0, W, H);
    };

    const resolve = () => {
      const t0 = performance.now();
      const steps = (now: number) => {
        const u = Math.min(1, (now - t0) / 2200);
        const e = 1 - Math.pow(1 - u, 3);
        draw(Math.max(1, Math.round(96 * Math.pow(1 - e, 2.2))));
        raf = u < 1 ? requestAnimationFrame(steps) : 0;
        if (u >= 1) draw(1);
      };
      raf = requestAnimationFrame(steps);
    };
    const begin = () => {
      if (began) return;
      began = true;
      if (reduced) draw(1);
      else resolve();
    };
    img.onload = () => {
      loaded = true;
      if (seen) begin();
    };
    img.src = src;

    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        seen = true;
        if (loaded) begin();
        io.disconnect();
      },
      { threshold: 0.35 }
    );
    io.observe(cv);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={cvRef} role="img" aria-label="Vishnu Payyannur Thotten" className={className} />;
}
