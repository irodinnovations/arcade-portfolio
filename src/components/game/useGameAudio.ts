'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { VoiceType } from './types';

interface UseGameAudioProps {
  muted: boolean;
}

export function useGameAudio({ muted }: UseGameAudioProps) {
  const voicesRef = useRef<Record<VoiceType, HTMLAudioElement> | null>(null);
  const unlockedRef = useRef(false);

  // Initialize audio elements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const voices: Record<VoiceType, HTMLAudioElement> = {
      beware: new Audio('/audio/voice-beware.mp3'),
      run: new Audio('/audio/voice-run.mp3'),
      escape: new Audio('/audio/voice-escape.mp3'),
      see: new Audio('/audio/voice-see.mp3'),
      ideas: new Audio('/audio/voice-ideas.mp3'),
      coward: new Audio('/audio/voice-coward.mp3'),
      laugh: new Audio('/audio/voice-laugh.mp3'),
    };

    // Preload all audio
    Object.values(voices).forEach((audio) => {
      audio.preload = 'auto';
      audio.load();
    });

    voicesRef.current = voices;
  }, []);

  // Unlock audio on user interaction (required for mobile)
  // We use volume=0 during unlock to prevent audible sound
  const unlockAudio = useCallback(() => {
    if (unlockedRef.current || !voicesRef.current) return;
    unlockedRef.current = true;

    Object.values(voicesRef.current).forEach((audio) => {
      const originalVolume = audio.volume;
      audio.volume = 0; // Silent unlock
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.volume = originalVolume;
        })
        .catch(() => {
          audio.volume = originalVolume;
        });
      audio.currentTime = 0;
    });
  }, []);

  useEffect(() => {
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, [unlockAudio]);

  const playVoice = useCallback(
    (name: VoiceType | string) => {
      if (muted || !voicesRef.current) return;

      try {
        const audio = voicesRef.current[name as VoiceType];
        if (audio) {
          audio.currentTime = 0;
          audio.playbackRate = 1.0;
          audio.volume = 0.9;
          audio.play().catch((e) => console.log('Audio play failed:', e));
        }
      } catch (e) {
        console.log('Voice error:', e);
      }
    },
    [muted]
  );

  return { playVoice, unlockAudio };
}
