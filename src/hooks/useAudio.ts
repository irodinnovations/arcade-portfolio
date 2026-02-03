'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type SoundType =
  | 'start'
  | 'navigate'
  | 'select'
  | 'hover'
  | 'countdown'
  | 'launch'
  | 'tick';

interface AudioHook {
  muted: boolean;
  toggle: () => void;
  play: (type: SoundType) => void;
}

export function useAudio(): AudioHook {
  const [muted, setMuted] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('arcade-sound-muted');
    if (stored !== null) {
      setMuted(stored === 'true');
    }
  }, []);

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;

    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (
      freq: number,
      volume: number,
      type: OscillatorType,
      delay: number,
      duration: number
    ) => {
      const ctx = getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    },
    [getContext]
  );

  const play = useCallback(
    (type: SoundType) => {
      if (muted) return;

      try {
        switch (type) {
          case 'start':
            playTone(200, 0.1, 'sine', 0, 0.1);
            playTone(300, 0.1, 'sine', 0.1, 0.1);
            playTone(400, 0.15, 'sine', 0.2, 0.15);
            playTone(600, 0.2, 'sine', 0.35, 0.2);
            break;

          case 'navigate':
            playTone(800, 0.05, 'square', 0, 0.03);
            playTone(1000, 0.03, 'square', 0.02, 0.02);
            break;

          case 'select':
            playTone(523, 0.1, 'sine', 0, 0.08);
            playTone(784, 0.15, 'sine', 0.08, 0.12);
            break;

          case 'hover':
            playTone(1200, 0.02, 'sine', 0, 0.02);
            break;

          case 'countdown':
            playTone(440, 0.1, 'square', 0, 0.08);
            break;

          case 'launch':
            playTone(262, 0.1, 'sawtooth', 0, 0.05);
            playTone(330, 0.1, 'sawtooth', 0.05, 0.05);
            playTone(392, 0.1, 'sawtooth', 0.1, 0.05);
            playTone(523, 0.2, 'sawtooth', 0.15, 0.1);
            playTone(659, 0.25, 'sawtooth', 0.2, 0.15);
            break;

          case 'tick':
            playTone(600, 0.03, 'sine', 0, 0.02);
            break;
        }
      } catch {
        // Audio not available
      }
    },
    [muted, playTone]
  );

  const toggle = useCallback(() => {
    setMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem('arcade-sound-muted', String(newValue));
      return newValue;
    });
  }, []);

  return { muted, toggle, play };
}
