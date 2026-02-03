'use client';

import type { ProjectStatus } from '@/lib/projects';

interface BadgeProps {
  status: ProjectStatus;
}

const statusStyles: Record<ProjectStatus, string> = {
  live: 'bg-gradient-to-br from-green-400 to-green-600 text-black',
  wip: 'bg-gradient-to-br from-amber-400 to-amber-600 text-black',
  concept: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
};

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-sm px-3 py-1 text-xs font-bold uppercase tracking-widest ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
