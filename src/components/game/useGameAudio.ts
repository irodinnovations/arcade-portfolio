'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { VoiceType } from './types';

interface UseGameAudioProps {
  muted: boolean;
}

// Voice cooldown: 3-6 seconds between voices
const MIN_COOLDOWN = 3000;
const MAX_COOLDOWN = 6000;

export function useGameAudio({ muted }: UseGameAudioProps) {
  const voicesRef = useRef<Record<VoiceType, HTMLAudioElement> | null>(null);
  const dialupRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const readyRef = useRef(false);
  const lastVoiceTimeRef = useRef(0);
  const cooldownRef = useRef(0);

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

    // Initialize dialup sound
    const dialup = new Audio('/audio/dialup.ogg');
    dialup.preload = 'auto';
    dialup.loop = false;
    dialup.load();
    dialupRef.current = dialup;

    // Preload all audio
    Object.values(voices).forEach((audio) => {
      audio.preload = 'auto';
      audio.load();
    });

    voicesRef.current = voices;
    readyRef.current = true;
    
    // Try to unlock now that voices are ready
    if (!unlockedRef.current) {
      unlockAudioInternal(voices, dialup);
    }
  }, []);

  // Internal unlock function that takes voices directly
  const unlockAudioInternal = useCallback((voices: Record<VoiceType, HTMLAudioElement>, dialup?: HTMLAudioElement) => {
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

    // Also unlock dialup audio
    if (dialup) {
      const originalVolume = dialup.volume;
      dialup.volume = 0;
      dialup
        .play()
        .then(() => {
          dialup.pause();
          dialup.currentTime = 0;
          dialup.volume = originalVolume;
        })
        .catch(() => {
          dialup.currentTime = 0;
          dialup.volume = originalVolume;
        });
    }
  }, []);

  // Public unlock function
  const unlockAudio = useCallback(() => {
    if (!readyRef.current || !voicesRef.current) return;
    unlockAudioInternal(voicesRef.current, dialupRef.current || undefined);
  }, [unlockAudioInternal]);

  // Play dialup sound
  const playDialup = useCallback(() => {
    if (muted || !dialupRef.current) return;
    
    try {
      dialupRef.current.currentTime = 0;
      dialupRef.current.volume = 0.7;
      dialupRef.current.play().catch(() => {
        // Silently handle - audio might not be unlocked yet
      });
    } catch {
      // Silently handle errors
    }
  }, [muted]);

  // Stop dialup sound
  const stopDialup = useCallback(() => {
    if (!dialupRef.current) return;
    
    try {
      dialupRef.current.pause();
      dialupRef.current.currentTime = 0;
    } catch {
      // Silently handle errors
    }
  }, []);

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
    (name: VoiceType | string, priority: boolean = false) => {
      if (muted || !voicesRef.current) return;

      const now = Date.now();
      
      // Check cooldown (priority voices like "beware" bypass cooldown)
      if (!priority) {
        const timeSinceLastVoice = now - lastVoiceTimeRef.current;
        if (timeSinceLastVoice < cooldownRef.current) {
          return; // Still in cooldown, skip this voice
        }
      }

      // Try to unlock if not already (handles edge cases)
      if (!unlockedRef.current) {
        unlockAudio();
      }

      try {
        const audio = voicesRef.current[name as VoiceType];
        if (audio) {
          // Stop ALL currently playing voices first
          Object.values(voicesRef.current).forEach((v) => {
            v.pause();
            v.currentTime = 0;
          });
          
          audio.playbackRate = 1.0;
          audio.volume = 0.9;
          
          const playPromise = audio.play();
          if (playPromise) {
            playPromise
              .then(() => {
                // Successfully started playing - set cooldown
                lastVoiceTimeRef.current = now;
                // Random cooldown between 3-6 seconds
                cooldownRef.current = MIN_COOLDOWN + Math.random() * (MAX_COOLDOWN - MIN_COOLDOWN);
              })
              .catch(() => {
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

  return { playVoice, unlockAudio, playDialup, stopDialup };
}
