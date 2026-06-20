import { useEffect, useRef, useState } from 'react';

export type LoadPhase = 'fast' | 'pause' | 'crawl' | 'burst' | 'freeze' | 'final' | 'done';

interface Segment {
  from: number;
  to: number;
  duration: number;
  label: LoadPhase;
}

// 5.6s glitchy loader timeline — matches the spec exactly
const TIMELINE: Segment[] = [
  { from: 0, to: 34, duration: 1400, label: 'fast' },
  { from: 34, to: 34, duration: 600, label: 'pause' },
  { from: 34, to: 52, duration: 1800, label: 'crawl' },
  { from: 52, to: 58, duration: 320, label: 'burst' },
  { from: 58, to: 58, duration: 800, label: 'freeze' },
  { from: 58, to: 100, duration: 720, label: 'final' },
];

// Debug flag — read from URL ?slow=N to extend the loader for screenshotting
const SLOW_MULT = (() => {
  if (typeof window === 'undefined') return 1;
  const m = new URLSearchParams(window.location.search).get('slow');
  return m ? Math.max(1, parseFloat(m)) : 1;
})();

export function useProgress() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<LoadPhase>('fast');
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = (now - startRef.current) * SLOW_MULT;
      const total = TIMELINE.reduce((s, t) => s + t.duration, 0);

      if (elapsed >= total) {
        setProgress(100);
        setPhase('done');
        return;
      }

      let acc = 0;
      for (const seg of TIMELINE) {
        const end = acc + seg.duration;
        if (elapsed <= end) {
          const local = (elapsed - acc) / seg.duration;
          const eased = local < 0.5
            ? 2 * local * local
            : 1 - Math.pow(-2 * local + 2, 2) / 2;
          setProgress(seg.from + (seg.to - seg.from) * eased);
          setPhase(seg.label);
          break;
        }
        acc = end;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { progress, phase };
}