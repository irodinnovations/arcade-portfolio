'use client';

import { useState, useEffect, useCallback } from 'react';
import { projects } from '@/lib/projects';
import { MascotDisplay } from '@/components/mascot/MascotDisplay';
import { RosterGrid } from '@/components/roster/RosterGrid';
import { Button, Badge } from '@/components/ui';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TIMER_DURATION, TIMER_WARNING_THRESHOLD } from '@/lib/constants';

interface SelectScreenProps {
  onTimerEnd: () => void;
  onNavigate: () => void;
  onSelect: () => void;
  onLaunch: () => void;
  onTick?: () => void;
  isVisible: boolean;
}

export function SelectScreen({
  onTimerEnd,
  onNavigate,
  onSelect,
  onLaunch,
  onTick,
  isVisible,
}: SelectScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const reducedMotion = useReducedMotion();

  const selectedProject = projects[selectedIndex];

  const resetTimer = useCallback(() => {
    setTimer(TIMER_DURATION);
  }, []);

  const handleSelect = useCallback(
    (index: number) => {
      if (index !== selectedIndex) {
        setSelectedIndex(index);
        onSelect();
      }
      resetTimer();
    },
    [selectedIndex, onSelect, resetTimer]
  );

  const handleHover = useCallback(
    (index: number) => {
      if (index !== selectedIndex) {
        onNavigate();
      }
    },
    [selectedIndex, onNavigate]
  );

  const handleLaunch = useCallback(() => {
    if (selectedProject?.url) {
      onLaunch();
      setTimeout(() => {
        window.open(selectedProject.url ?? '', '_blank');
      }, 300);
    }
  }, [selectedProject, onLaunch]);

  // Keyboard navigation
  useKeyboard({
    onLeft: () => {
      const newIndex =
        (selectedIndex - 1 + projects.length) % projects.length;
      handleSelect(newIndex);
      onNavigate();
    },
    onRight: () => {
      const newIndex = (selectedIndex + 1) % projects.length;
      handleSelect(newIndex);
      onNavigate();
    },
    onEnter: handleLaunch,
    enabled: isVisible,
  });

  // Timer countdown
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          onTimerEnd();
          // Don't reset - the game will start!
          return 0;
        }
        const newValue = prev - 1;
        // Play tick sound in warning zone (10 seconds and under)
        if (newValue <= TIMER_WARNING_THRESHOLD && onTick) {
          onTick();
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onTimerEnd, onTick]);

  // Reset timer when becoming visible again (e.g., returning from game)
  useEffect(() => {
    if (isVisible) {
      setTimer(TIMER_DURATION);
    }
  }, [isVisible]);

  if (!selectedProject) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-all duration-500 ${
        isVisible
          ? 'scale-100 opacity-100'
          : 'pointer-events-none scale-95 opacity-0'
      }`}
    >
      {/* Header */}
      <header className="z-10 flex flex-col items-center bg-gradient-to-b from-[rgba(0,20,40,0.9)] to-transparent px-8 py-3">
        <h1 className="mb-2 font-orbitron text-[clamp(1rem,3vw,1.5rem)] font-bold uppercase tracking-[0.2em] text-white [text-shadow:0_0_20px_rgba(0,212,255,0.5)]">
          Project Select
        </h1>
        <div
          className={`rounded border-2 bg-[rgba(255,215,0,0.1)] px-4 py-1 font-orbitron text-2xl font-bold text-amber-400 [text-shadow:0_0_10px_rgba(255,215,0,0.5)] ${
            timer <= TIMER_WARNING_THRESHOLD
              ? `border-orange-500 text-orange-500 ${
                  reducedMotion ? '' : 'animate-[timerPulse_0.5s_ease_infinite]'
                }`
              : 'border-amber-400'
          }`}
          role="timer"
          aria-label={`Time remaining: ${timer} seconds`}
        >
          {timer.toString().padStart(2, '0')}
        </div>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-8"
      >
        {/* Center stage - scrollable area */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-start overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-900/50">
          <div className="flex flex-shrink-0 items-center justify-center">
            <MascotDisplay project={selectedProject} />
          </div>

          {/* Project info */}
          <div className="mt-4 max-w-[600px] flex-shrink-0 pb-4 text-center">
            <h2 className="mb-2 font-orbitron text-[clamp(1.5rem,4vw,2.5rem)] font-bold uppercase tracking-wider text-white [text-shadow:0_0_20px_rgba(0,212,255,0.5)]">
              {selectedProject.name}
            </h2>

            <Badge status={selectedProject.status} />

            <p className="mb-4 mt-3 line-clamp-4 text-sm leading-relaxed text-[#5080b0] md:line-clamp-none md:text-base">
              {selectedProject.description}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {selectedProject.isPersonal ? (
                <>
                  <Button
                    onClick={() =>
                      window.open('https://www.linkedin.com/in/rodney-john', '_blank')
                    }
                    variant="primary"
                  >
                    LinkedIn
                  </Button>
                  <Button
                    onClick={() => {
                      const contactSection = document.getElementById('contact-section');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.location.href = 'mailto:irodinnovations@gmail.com?subject=Let\'s Connect';
                      }
                    }}
                    variant="secondary"
                  >
                    Connect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleLaunch}
                  disabled={!selectedProject.url}
                  variant="primary"
                >
                  Launch
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Roster grid */}
        <RosterGrid
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          onHover={handleHover}
        />
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-2 bg-[rgba(0,10,20,0.9)] px-8 py-3 text-xs text-[#5080b0]">
        <div className="flex gap-6">
          <span>
            <kbd className="mr-1 rounded border border-[#1a2545] bg-[#0d1428] px-2 py-0.5 font-orbitron text-[0.6rem]">
              ←
            </kbd>
            <kbd className="mr-1 rounded border border-[#1a2545] bg-[#0d1428] px-2 py-0.5 font-orbitron text-[0.6rem]">
              →
            </kbd>
            Navigate
          </span>
          <span>
            <kbd className="mr-1 rounded border border-[#1a2545] bg-[#0d1428] px-2 py-0.5 font-orbitron text-[0.6rem]">
              Enter
            </kbd>
            Select
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://www.linkedin.com/in/rodney-john"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5080b0] transition-colors hover:text-cyan-400"
          >
            LinkedIn
          </a>
          <a
            href="https://vibecodersdispatch.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5080b0] transition-colors hover:text-cyan-400"
          >
            Substack
          </a>
          <a
            href="https://omrnewsletter.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5080b0] transition-colors hover:text-cyan-400"
          >
            OMR
          </a>
        </div>
        <div className="opacity-50">rodneyjohn.com</div>
      </footer>
    </div>
  );
}
