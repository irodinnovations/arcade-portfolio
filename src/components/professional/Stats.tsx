'use client'

import { STATS } from '@/lib/professional'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import clsx from 'clsx'

export function Stats() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      ref={ref}
      className={clsx(
        'border-b border-border px-6 py-16 transition-all delay-100 duration-700',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      aria-label="Key statistics"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {STATS.map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="mb-1 text-4xl font-bold text-foreground sm:text-5xl">
              {value}
            </div>
            <div className="text-sm text-text-muted">{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
