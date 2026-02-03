'use client';

import Image from 'next/image';
import type { Project } from '@/lib/projects';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface RosterCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
}

const statusColors = {
  live: 'bg-green-400 shadow-[0_0_8px_#00ff88]',
  wip: 'bg-amber-400 shadow-[0_0_8px_#ffaa00]',
  concept: 'bg-purple-400 shadow-[0_0_8px_#8866ff]',
};

export function RosterCard({
  project,
  isSelected,
  onSelect,
  onHover,
}: RosterCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <button
      id={`project-${project.id}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={`relative h-[90px] w-[80px] cursor-pointer overflow-hidden rounded border-2 bg-[#0d1428] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#050810] md:h-[90px] md:w-[80px] ${
        isSelected
          ? `border-cyan-400 shadow-[0_0_30px_rgba(0,212,255,0.6),inset_0_0_20px_rgba(0,212,255,0.1)] ${
              reducedMotion ? '' : 'animate-[selectedPulse_1s_ease_infinite]'
            } -translate-y-2 scale-110`
          : 'border-[#1a2545] hover:-translate-y-1.5 hover:scale-105 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]'
      }`}
      aria-label={`Select ${project.name}`}
      aria-pressed={isSelected}
    >
      {/* Status dot */}
      <div
        className={`absolute right-1 top-1 z-10 h-1.5 w-1.5 rounded-full ${statusColors[project.status]}`}
        aria-hidden="true"
      />

      {/* P1 indicator */}
      {isSelected && (
        <span
          className={`absolute left-0.5 top-0.5 z-10 rounded bg-cyan-400 px-1 py-0.5 font-orbitron text-[0.5rem] font-bold text-black ${
            reducedMotion ? '' : 'animate-[p1Flash_0.5s_ease_infinite_alternate]'
          }`}
        >
          P1
        </span>
      )}

      {/* Mascot image */}
      <Image
        src={project.mascot}
        alt={project.name}
        fill
        sizes="80px"
        className="object-cover object-top transition-[filter] duration-200 hover:brightness-110"
      />

      {/* Name label */}
      <span
        className={`absolute bottom-0 left-0 right-0 z-10 bg-black/90 py-1 text-center font-orbitron text-[0.5rem] uppercase tracking-wider transition-all duration-200 ${
          isSelected
            ? 'translate-y-0 text-cyan-400'
            : 'translate-y-full text-[#5080b0] group-hover:translate-y-0'
        }`}
      >
        {project.name.split(' ')[0]}
      </span>

      {/* Scanline overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,212,255,0.2)] opacity-0 transition-opacity duration-200 ${
          isSelected || 'hover:opacity-100'
        } ${isSelected ? 'opacity-100' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
