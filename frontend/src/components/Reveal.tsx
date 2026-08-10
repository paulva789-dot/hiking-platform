'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Scroll-triggered reveal: children render invisibly (reserving their
 * layout space, so nothing jumps) until the wrapper enters the viewport,
 * then remount fresh so any mount-triggered animation inside them (like
 * AnimatedText's word stagger) plays exactly when the user scrolls to it,
 * not the instant the page loads off-screen.
 */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {visible ? <div key="revealed">{children}</div> : <div style={{ opacity: 0 }}>{children}</div>}
    </div>
  );
}
