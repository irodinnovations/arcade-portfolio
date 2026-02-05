'use client'

import { TIMELINE } from '@/lib/professional'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import clsx from 'clsx'

export function Timeline() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      ref={ref}
      id="background"
      className={clsx(
        'border-t border-border px-6 py-20 transition-all delay-200 duration-700',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      aria-labelledby="timeline-heading"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            Background
          </p>
          <h2 id="timeline-heading" className="text-3xl font-bold tracking-tight">
            Where I&apos;ve Been
          </h2>
        </div>

        <ol className="relative border-l-2 border-border pl-8" aria-label="Career timeline">
          {TIMELINE.map(({ date, title, company, highlights }, index) => (
            <li
              key={title}
              className={clsx('relative pb-10', index === TIMELINE.length - 1 && 'pb-0')}
            >
              {/* Timeline dot */}
              <div
                className="absolute -left-[calc(2rem+7px)] top-2 h-3 w-3 rounded-full border-[3px] border-background bg-accent"
                aria-hidden="true"
              />

              <time className="mb-2 block text-sm text-text-muted">{date}</time>
              <h3 className="mb-1 text-lg font-semibold">{title}</h3>
              <p className="mb-3 text-text-muted">{company}</p>

              <ul className="space-y-1.5" aria-label={`Highlights from ${title}`}>
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="relative pl-5 text-sm text-text-muted"
                  >
                    <span
                      className="absolute left-0 text-accent"
                      aria-hidden="true"
                    >
                      →
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
