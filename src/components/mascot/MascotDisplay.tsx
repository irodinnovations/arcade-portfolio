'use client';

import Image from 'next/image';
import type { Project } from '@/lib/projects';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MascotDisplayProps {
  project: Project;
}

export function MascotDisplay({ project }: MascotDisplayProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative flex h-[350px] w-full max-w-[500px] items-center justify-center">
      {/* Glow effect */}
      <div
        className={`absolute bottom-0 left-1/2 h-[100px] w-[300px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.3)_0%,transparent_70%)] blur-[20px] ${
          reducedMotion
            ? ''
            : 'animate-[glowPulse_3s_ease-in-out_infinite]'
        }`}
        aria-hidden="true"
      />

      {/* Mascot image */}
      <Image
        src={project.mascot}
        alt={project.name}
        width={400}
        height={400}
        priority
        className={`max-h-full max-w-full object-contain drop-shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all duration-300 ${
          reducedMotion
            ? ''
            : 'animate-[idleFloat_4s_ease-in-out_infinite]'
        }`}
      />
    </div>
  );
}
