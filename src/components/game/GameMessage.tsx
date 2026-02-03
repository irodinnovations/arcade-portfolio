'use client';

interface GameMessageProps {
  type: 'victory' | 'defeat';
  score: number;
  hasBombs: boolean;
  wasBossPhase: boolean;
  onRetry: () => void;
  onQuit: () => void;
}

export function GameMessage({
  type,
  score,
  hasBombs,
  wasBossPhase,
  onRetry,
  onQuit,
}: GameMessageProps) {
  const isVictory = type === 'victory';

  const getMessage = () => {
    if (isVictory) {
      return 'You defeated the Builder!';
    }
    if (!hasBombs && wasBossPhase) {
      return 'You had no bombs to fight the Builder!';
    }
    return 'The Builder wins this time.';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Animated background */}
      <div
        className={`
          absolute inset-0 opacity-20
          ${isVictory ? 'bg-gradient-to-br from-green-600 via-cyan-600 to-blue-600' : 'bg-gradient-to-br from-red-900 via-black to-red-900'}
        `}
      />

      {/* Content */}
      <div className="relative z-10 mx-4 max-w-md text-center">
        {/* Title */}
        <h2
          className={`
            mb-4 font-orbitron text-5xl font-bold uppercase
            ${isVictory ? 'animate-pulse text-green-400' : 'text-red-500'}
          `}
          style={{
            textShadow: isVictory
              ? '0 0 30px rgba(0, 255, 100, 0.8)'
              : '0 0 30px rgba(255, 0, 0, 0.5)',
          }}
        >
          {isVictory ? 'VICTORY!' : 'DEFEATED'}
        </h2>

        {/* Message */}
        <p className="mb-2 text-lg text-white/80">{getMessage()}</p>

        {/* Score */}
        <p className="mb-8 font-orbitron text-2xl text-amber-400">
          Score: {score.toLocaleString()}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onRetry}
            className="
              rounded-lg border-2 border-cyan-500 bg-cyan-500/20 px-8 py-3
              font-orbitron font-bold uppercase tracking-wider text-cyan-400
              transition-all duration-200
              hover:bg-cyan-500/40 active:scale-95
            "
          >
            Try Again
          </button>
          <button
            onClick={onQuit}
            className="
              rounded-lg border-2 border-gray-500 bg-gray-500/20 px-8 py-3
              font-orbitron font-bold uppercase tracking-wider text-gray-400
              transition-all duration-200
              hover:bg-gray-500/40 active:scale-95
            "
          >
            Back to Projects
          </button>
        </div>
      </div>

      {/* Victory particles */}
      {isVictory && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 animate-ping rounded-full bg-yellow-400"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
