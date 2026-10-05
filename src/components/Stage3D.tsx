import { useEffect, useRef } from "react";
import { FRAG } from "../gl/world";

// One world, one camera, whole film. A single fixed raymarched corridor sits behind every
// chapter; the anchor table hands the camera forward as the page descends — the opening frame
// is the mouth of the corridor, the finale is its far end. Chapters only ever change how BRIGHT
// the world burns behind them (uDim), never where the camera is. Pointer banks, scroll speed
// warps the lens, the body breathes.

const ANCHORS: { id: string; z0: number; z1: number; dim: number }[] = [
  { id: "hero", z0: 22, z1: 8, dim: 0.55 },
  { id: "world", z0: 6, z1: -146, dim: 1 },
  { id: "skills", z0: -152, z1: -170, dim: 0.5 },
  { id: "experience", z0: -176, z1: -198, dim: 0.5 },
  { id: "cases", z0: -204, z1: -224, dim: 0.34 },
  { id: "education", z0: -230, z1: -242, dim: 0.5 },
  { id: "contact", z0: -248, z1: -270, dim: 0.62 },
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const damp = (v: number, to: number, k: number, dt: number) => v + (to - v) * (1 - Math.exp(-k * dt));

function chapter(): { z: number; dim: number } {
  const probe = window.innerHeight * 0.5;
  for (const a of ANCHORS) {
    const el = document.getElementById(a.id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top > probe || r.bottom <= probe) continue;
    let u: number;
    if (a.id === "world") {
      const room = el.offsetHeight - window.innerHeight;
      u = room > 4 ? clamp01(-r.top / room) : 0;
    } else {
      u = clamp01((probe - r.top) / Math.max(1, r.height));
    }
    return { z: a.z0 + (a.z1 - a.z0) * u, dim: a.dim };
  }
  return { z: ANCHORS[0].z0, dim: ANCHORS[0].dim };
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Stage3D() {
  const cvRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const gl = cv.getContext("webgl");
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("stage shader:", gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }");
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("stage link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      camZ: gl.getUniformLocation(prog, "uCamZ"),
      vel: gl.getUniformLocation(prog, "uVel"),
      wake: gl.getUniformLocation(prog, "uWake"),
      ptr: gl.getUniformLocation(prog, "uPtr"),
      dim: gl.getUniformLocation(prog, "uDim"),
    };
    gl.clearColor(0.027, 0.031, 0.041, 1);

    const dpr = () => Math.min(window.devicePixelRatio || 1, 1.25);
    const size = () => {
      cv.width = Math.floor(window.innerWidth * dpr());
      cv.height = Math.floor(window.innerHeight * dpr());
      gl.viewport(0, 0, cv.width, cv.height);
    };
    size();
    window.addEventListener("resize", size);

    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPtr = (e: PointerEvent) => {
      ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onPtr, { passive: true });

    const draw = (time: number, camZ: number, vel: number, wake: number, dim: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.res, cv.width, cv.height);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.camZ, camZ);
      gl.uniform1f(u.vel, vel);
      gl.uniform1f(u.wake, wake);
      gl.uniform2f(u.ptr, ptr.x, ptr.y);
      gl.uniform1f(u.dim, dim);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const target = chapter();

    if (reduced()) {
      // settled frame: parked mid-corridor, fully awake, dim — no rAF ever runs
      ptr.x = 0;
      ptr.y = 0;
      draw(0, -66, 0, 1, 0.45);
      return () => {
        window.removeEventListener("resize", size);
        window.removeEventListener("pointermove", onPtr);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }

    let camZ = target.z + 34; // start further back: the film opens out of darkness
    let dim = 0.12;
    let vel = 0;
    let wake = 0;
    let warp = 0;
    let last = 0;
    let running = false;
    let raf = 0;
    const t0 = performance.now();

    // chapter cut = the camera punches forward through the corridor: lunge, lens widens,
    // frame rolls, the room flares as it passes — one continuous take, physically felt
    const onWarp = () => {
      warp = 1;
    };
    window.addEventListener("cine:warp", onWarp);

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      wake = Math.min(1, wake + dt / 1.6); // staged blackout lift
      const time = (now - t0) / 1000;
      warp = Math.max(0, warp - dt * 1.7);

      const ch = chapter();
      const drift = Math.sin(time * 0.11) * 2; // idle cameras are never perfectly still
      vel = damp(vel, clamp01(Math.abs(ch.z - camZ) / 50), 6, dt);
      vel = Math.max(vel, warp * 0.85);
      camZ = damp(camZ, ch.z + drift - warp * 13, 2.6 + warp * 5, dt);
      dim = damp(dim, Math.min(1.3, ch.dim + warp * 0.45), 1.8, dt);
      ptr.x = damp(ptr.x, ptr.tx, 2.2, dt);
      ptr.y = damp(ptr.y, ptr.ty, 2.2, dt);

      draw(time, camZ, vel, wake, dim);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      onVis();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("cine:warp", onWarp);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onPtr);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={cvRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 0.9 }}
    />
  );
}
