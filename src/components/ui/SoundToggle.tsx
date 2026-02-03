'use client';

interface SoundToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export function SoundToggle({ muted, onToggle }: SoundToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`fixed right-4 top-4 z-[200] flex h-11 w-11 items-center justify-center rounded-lg border-2 bg-[rgba(0,20,40,0.8)] text-xl transition-all hover:border-cyan-400 hover:bg-[rgba(0,212,255,0.1)] focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
        muted ? 'border-[#1a2545] opacity-50' : 'border-[#1a2545]'
      }`}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
