'use client'

import { PROJECTS } from '@/lib/professional'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import clsx from 'clsx'

export function Projects() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      ref={ref}
      id="projects"
      className={clsx(
        'px-6 py-20 transition-all delay-200 duration-700',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            Recent Work
          </p>
          <h2
            id="projects-heading"
            className="text-3xl font-bold tracking-tight"
          >
            Things I&apos;ve Built
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {PROJECTS.map(({ tag, title, description, stats, link }) => (
            <article
              key={title}
              className="group grid items-center gap-6 rounded-xl border border-border bg-surface p-8 transition-all hover:border-accent sm:grid-cols-[1fr_auto]"
            >
              <div>
                <span className="mb-3 inline-block rounded bg-accent-glow px-2.5 py-1 text-xs font-semibold text-accent">
                  {tag}
                </span>
                <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                <p className="mb-4 text-text-muted">{description}</p>
                <div className="flex flex-wrap gap-6">
                  {stats.map(({ value, label }) => (
                    <div key={label} className="text-sm">
                      <strong className="text-foreground">{value}</strong>{' '}
                      <span className="text-text-muted">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href={link}
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-accent transition-colors hover:underline focus-visible:outline-accent"
                aria-label={`View ${title} project`}
              >
                View project <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
