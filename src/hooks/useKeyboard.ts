'use client';

import { useEffect, useCallback } from 'react';

interface UseKeyboardOptions {
  onLeft?: () => void;
  onRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useKeyboard(options: UseKeyboardOptions): void {
  const { onLeft, onRight, onEnter, onEscape, enabled = true } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onRight?.();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onEnter?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
      }
    },
    [enabled, onLeft, onRight, onEnter, onEscape]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
