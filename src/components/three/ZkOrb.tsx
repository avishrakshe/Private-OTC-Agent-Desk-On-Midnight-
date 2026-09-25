import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../ui/motion';

export type OrbMode = 'idle' | 'active' | 'success' | 'error';

type Vec3 = [number, number, number];
type RGB = [number, number, number];

const PALETTE: Record<OrbMode, { shell: RGB; core: RGB; speed: number }> = {
  idle: { shell: [155, 138, 255], core: [194, 247, 58], speed: 0.0032 },
  active: { shell: [98, 230, 255], core: [155, 138, 255], speed: 0.014 },
  success: { shell: [194, 247, 58], core: [230, 255, 190], speed: 0.005 },
  error: { shell: [255, 107, 129], core: [255, 191, 92], speed: 0.0025 },
};

/** Evenly distributed points on a unit sphere. */
const fibonacciSphere = (n: number, r: number): Vec3[] => {
  const pts: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push([Math.cos(theta) * rad * r, y * r, Math.sin(theta) * rad * r]);
  }
  return pts;
};

/** Rotation preserves distances, so neighbour pairs are computed once. */
const neighbourPairs = (pts: Vec3[], maxDist: number): [number, number][] => {
  const pairs: [number, number][] = [];
  const max2 = maxDist * maxDist;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i][0] - pts[j][0];
      const dy = pts[i][1] - pts[j][1];
      const dz = pts[i][2] - pts[j][2];
      if (dx * dx + dy * dy + dz * dz < max2) pairs.push([i, j]);
    }
  }
  return pairs;
};

const ring = (n: number, r: number, tiltX: number, tiltZ: number): Vec3[] => {
  const out: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let x = Math.cos(a) * r;
    let y = 0;
    let z = Math.sin(a) * r;
    // tilt around X
    const y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
    const z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
    y = y1;
    z = z1;
    // tilt around Z
    const x2 = x * Math.cos(tiltZ) - y * Math.sin(tiltZ);
    const y2 = x * Math.sin(tiltZ) + y * Math.cos(tiltZ);
    out.push([x2, y2, z]);
  }
  return out;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

interface ZkOrbProps {
  mode?: OrbMode;
  className?: string;
}

/**
 * Dependency-free 3D "shielded vault": a particle shell (public proof surface) around a sealed
 * core (private witnesses), wrapped in orbit rings. Reacts to pointer position and tx state.
 */
export const ZkOrb: React.FC<ZkOrbProps> = ({ mode = 'idle', className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<OrbMode>(mode);
  const pulseRef = useRef(0);

  useEffect(() => {
    if (mode === 'success' && modeRef.current !== 'success') pulseRef.current = 1;
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const shell = fibonacciSphere(260, 1);
    const shellPairs = neighbourPairs(shell, 0.24);
    const core = fibonacciSphere(70, 0.38);
    const corePairs = neighbourPairs(core, 0.2);
    const rings = [ring(90, 1.32, 1.2, 0.35), ring(90, 1.5, 1.45, -0.55), ring(90, 1.18, 0.25, 1.1)];

    const shellColor: RGB = [...PALETTE[modeRef.current].shell];
    const coreColor: RGB = [...PALETTE[modeRef.current].core];
    let speed = PALETTE[modeRef.current].speed;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pointer-driven tilt (smoothed)
    let targetTiltX = 0;
    let targetTiltY = 0;
    let tiltX = 0;
    let tiltY = 0;
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetTiltY = ((e.clientX - (rect.left + rect.width / 2)) / window.innerWidth) * 1.2;
      targetTiltX = ((e.clientY - (rect.top + rect.height / 2)) / window.innerHeight) * 1.2;
    };
    if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true });

    let angle = 0.6;
    let t = 0;
    let running = true;
    let visible = true;
    let raf = 0;

    const project = (p: Vec3, rotY: number, rotX: number) => {
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const x1 = p[0] * cy - p[2] * sy;
      const z1 = p[0] * sy + p[2] * cy;
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);
      const y2 = p[1] * cx - z1 * sx;
      const z2 = p[1] * sx + z1 * cx;
      const radius = Math.min(width, height) * 0.3;
      const persp = 3.2 / (3.2 - z2);
      return { x: width / 2 + x1 * radius * persp, y: height / 2 + y2 * radius * persp, z: z2, s: persp };
    };

    const draw = () => {
      const target = PALETTE[modeRef.current];
      for (let i = 0; i < 3; i++) {
        shellColor[i] = lerp(shellColor[i], target.shell[i], 0.04);
        coreColor[i] = lerp(coreColor[i], target.core[i], 0.04);
      }
      speed = lerp(speed, target.speed, 0.03);
      tiltX = lerp(tiltX, targetTiltX, 0.05);
      tiltY = lerp(tiltY, targetTiltY, 0.05);

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const rotY = angle + tiltY;
      const rotX = -0.35 + tiltX + Math.sin(t * 0.3) * 0.05;

      // Orbit rings with travelling "packets"
      rings.forEach((r, ri) => {
        const rRot = rotY * (ri === 1 ? -0.7 : 1) + ri;
        const proj = r.map((p) => project(p, rRot, rotX));
        for (let i = 0; i < proj.length; i++) {
          const a = proj[i];
          const b = proj[(i + 1) % proj.length];
          const depth = (a.z + 1.6) / 3.2;
          ctx.strokeStyle = rgba(ri === 2 ? coreColor : shellColor, 0.05 + depth * 0.18);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const packets = modeRef.current === 'active' ? 3 : 1;
        for (let k = 0; k < packets; k++) {
          const idx = Math.floor(((t * (0.9 + ri * 0.35) + k / packets) % 1) * proj.length);
          const p = proj[idx];
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10 * p.s);
          glow.addColorStop(0, rgba(coreColor, 0.9));
          glow.addColorStop(1, rgba(coreColor, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 10 * p.s, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Sealed core
      const coreRot = -rotY * 1.6;
      const coreProj = core.map((p) => project(p, coreRot, rotX * 1.3));
      ctx.lineWidth = 1;
      for (const [i, j] of corePairs) {
        const a = coreProj[i];
        const b = coreProj[j];
        ctx.strokeStyle = rgba(coreColor, 0.18 + ((a.z + b.z) / 2 + 0.4) * 0.25);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      const coreGlowR = Math.min(width, height) * 0.16;
      const cg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, coreGlowR);
      cg.addColorStop(0, rgba(coreColor, 0.28 + Math.sin(t * 2) * 0.05));
      cg.addColorStop(1, rgba(coreColor, 0));
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, coreGlowR, 0, Math.PI * 2);
      ctx.fill();

      // Shell lattice
      const shellProj = shell.map((p) => project(p, rotY, rotX));
      for (const [i, j] of shellPairs) {
        const a = shellProj[i];
        const b = shellProj[j];
        const depth = ((a.z + b.z) / 2 + 1) / 2;
        ctx.strokeStyle = rgba(shellColor, 0.03 + depth * depth * 0.32);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (const p of shellProj) {
        const depth = (p.z + 1) / 2;
        ctx.fillStyle = rgba(shellColor, 0.15 + depth * 0.85);
        ctx.beginPath();
        ctx.arc(p.x, p.y, (0.6 + depth * 1.6) * p.s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Settlement pulse
      if (pulseRef.current > 0.01) {
        const pr = Math.min(width, height) * (0.3 + (1 - pulseRef.current) * 0.35);
        ctx.strokeStyle = rgba(coreColor, pulseRef.current * 0.8);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, pr, 0, Math.PI * 2);
        ctx.stroke();
        pulseRef.current *= 0.965;
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = () => {
      if (!running) return;
      if (visible && !document.hidden) {
        angle += speed;
        t += 0.006 + speed * 0.6;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    let io: IntersectionObserver | undefined;
    if (reduced) {
      draw();
    } else {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(canvas);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};
