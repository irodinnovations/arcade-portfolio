'use client';

import { projects } from '@/lib/projects';
import { RosterCard } from './RosterCard';

interface RosterGridProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
}

export function RosterGrid({
  selectedIndex,
  onSelect,
  onHover,
}: RosterGridProps) {
  return (
    <nav
      className="border-t border-[#1a2545] bg-gradient-to-t from-[rgba(0,20,40,0.8)] to-transparent py-4"
      aria-label="Project roster"
    >
      <div className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-2 px-2 md:gap-2">
        {projects.map((project, index) => (
          <RosterCard
            key={project.id}
            project={project}
            isSelected={index === selectedIndex}
            onSelect={() => onSelect(index)}
            onHover={() => onHover(index)}
          />
        ))}
      </div>
    </nav>
  );
}
