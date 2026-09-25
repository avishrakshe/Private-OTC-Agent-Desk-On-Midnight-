import React, { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

type TiltProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Maximum rotation in degrees. */
  max?: number;
  as?: 'div' | 'article' | 'section' | 'li';
};

/**
 * Pointer-driven 3D tilt with a moving glare. Writes CSS variables directly on the element
 * (no React re-renders per frame). Disabled for touch input and reduced-motion users.
 */
export const TiltCard: React.FC<TiltProps> = ({ max = 7, as = 'div', className = '', children, ...rest }) => {
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef(0);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.classList.add('is-tilting');
      el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
      el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
      el.style.setProperty('--glare', '1');
    });
  };

  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--glare', '0');
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const Tag = as as any;
  return (
    <Tag
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
};

type RevealProps = React.HTMLAttributes<HTMLDivElement> & {
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
};

/** Fades/slides content in the first time it scrolls into view. */
export const Reveal: React.FC<RevealProps> = ({ delay = 0, as = 'div', className = '', style, children, ...rest }) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as any;
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ ...style, ['--delay' as any]: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/**
 * Writes scroll progress (0 → 1) as `--t` on the element while it travels from the bottom of
 * the viewport to ~35% from the top. Drives the terminal's "tilt flat as you scroll" effect.
 */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.setProperty('--t', '1');
      return;
    }
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.95;
      const end = vh * 0.35;
      const t = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      el.style.setProperty('--t', t.toFixed(3));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);
}

/** Normalised pointer position (-1..1) relative to the viewport centre, for parallax. */
export function usePointerParallax(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [ref]);
}
