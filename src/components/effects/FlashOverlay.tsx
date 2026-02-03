'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FlashOverlayProps {
  trigger: number;
}

export function FlashOverlay({ trigger }: FlashOverlayProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (trigger > 0 && !reducedMotion) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [trigger, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[1000] bg-cyan-400 transition-opacity duration-150 ${
        isFlashing ? 'opacity-50' : 'opacity-0'
      }`}
      aria-hidden="true"
    />
  );
}
