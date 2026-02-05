'use client'

import { CAPABILITIES } from '@/lib/professional'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import clsx from 'clsx'

export function Capabilities() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      ref={ref}
      id="work"
      className={clsx(
        'px-6 py-20 transition-all delay-150 duration-700',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      aria-labelledby="capabilities-heading"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            What I Do
          </p>
          <h2
            id="capabilities-heading"
            className="text-3xl font-bold tracking-tight"
          >
            Problems I Solve
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {CAPABILITIES.map(({ icon, title, description }) => (
            <article
              key={title}
              className="group rounded-xl border border-border bg-surface p-8 transition-all hover:-translate-y-1 hover:border-accent"
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-glow text-2xl"
                aria-hidden="true"
              >
                {icon}
              </div>
              <h3 className="mb-3 text-lg font-semibold">{title}</h3>
              <p className="text-text-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
