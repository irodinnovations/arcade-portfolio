'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { VoiceType } from './types';

interface UseGameAudioProps {
  muted: boolean;
}

export function useGameAudio({ muted }: UseGameAudioProps) {
  const voicesRef = useRef<Record<VoiceType, HTMLAudioElement> | null>(null);
  const unlockedRef = useRef(false);
  const readyRef = useRef(false);

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
    readyRef.current = true;
    
    // Try to unlock now that voices are ready
    if (!unlockedRef.current) {
      unlockAudioInternal(voices);
    }
  }, []);

  // Internal unlock function that takes voices directly
  const unlockAudioInternal = useCallback((voices: Record<VoiceType, HTMLAudioElement>) => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;

    Object.values(voices).forEach((audio) => {
      const originalVolume = audio.volume;
      audio.volume = 0; // Silent unlock
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = originalVolume;
        })
        .catch(() => {
          audio.currentTime = 0;
          audio.volume = originalVolume;
        });
    });
  }, []);

  // Public unlock function
  const unlockAudio = useCallback(() => {
    if (!readyRef.current || !voicesRef.current) return;
    unlockAudioInternal(voicesRef.current);
  }, [unlockAudioInternal]);

  // Listen for user interactions to unlock
  useEffect(() => {
    const handler = () => unlockAudio();
    
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('click', handler, { once: true });

    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
  }, [unlockAudio]);

  const playVoice = useCallback(
    (name: VoiceType | string) => {
      if (muted || !voicesRef.current) return;

      // Try to unlock if not already (handles edge cases)
      if (!unlockedRef.current) {
        unlockAudio();
      }

      try {
        const audio = voicesRef.current[name as VoiceType];
        if (audio) {
          // Stop any currently playing instance of this voice
          audio.pause();
          audio.currentTime = 0;
          audio.playbackRate = 1.0;
          audio.volume = 0.9;
          
          const playPromise = audio.play();
          if (playPromise) {
            playPromise.catch(() => {
              // Silently handle - audio might not be unlocked yet
            });
          }
        }
      } catch {
        // Silently handle errors
      }
    },
    [muted, unlockAudio]
  );

  return { playVoice, unlockAudio };
}
