'use client';

import { useState, useCallback } from 'react';
import { StartScreen } from '@/components/screens/StartScreen';
import { SelectScreen } from '@/components/screens/SelectScreen';
import { Background } from '@/components/effects/Background';
import { CRTOverlay } from '@/components/effects/CRTOverlay';
import { FlashOverlay } from '@/components/effects/FlashOverlay';
import { SoundToggle } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAudio } from '@/hooks/useAudio';

type ScreenState = 'start' | 'select' | 'game';

export function Portfolio() {
  const [screen, setScreen] = useState<ScreenState>('start');
  const [isExiting, setIsExiting] = useState(false);
  const [flashTrigger, setFlashTrigger] = useState(0);
  const { muted, toggle, play } = useAudio();

  const triggerFlash = useCallback(() => {
    setFlashTrigger((prev) => prev + 1);
  }, []);

  const handleStart = useCallback(() => {
    play('start');
    setIsExiting(true);
    setTimeout(() => {
      setScreen('select');
    }, 500);
  }, [play]);

  const handleTimerEnd = useCallback(() => {
    // Start game when timer ends
    play('launch');
    setScreen('game');
    // For now, just reset to select screen
    // Game will be implemented in Step 9
    setTimeout(() => {
      setScreen('select');
    }, 100);
  }, [play]);

  const handleNavigate = useCallback(() => {
    play('navigate');
  }, [play]);

  const handleSelect = useCallback(() => {
    play('select');
    triggerFlash();
  }, [play, triggerFlash]);

  const handleLaunch = useCallback(() => {
    play('launch');
    triggerFlash();
  }, [play, triggerFlash]);

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen overflow-hidden bg-[#050810]">
        <Background />
        <CRTOverlay />
        <FlashOverlay trigger={flashTrigger} />

        <SoundToggle muted={muted} onToggle={toggle} />

        {screen === 'start' && (
          <StartScreen onStart={handleStart} isExiting={isExiting} />
        )}

        <SelectScreen
          isVisible={screen === 'select'}
          onTimerEnd={handleTimerEnd}
          onNavigate={handleNavigate}
          onSelect={handleSelect}
          onLaunch={handleLaunch}
        />
      </div>
    </ErrorBoundary>
  );
}
