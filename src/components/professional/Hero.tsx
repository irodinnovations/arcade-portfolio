'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import clsx from 'clsx'

export function Hero() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      ref={ref}
      className={clsx(
        'px-6 pb-20 pt-24 transition-all duration-700',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-4xl">
        {/* Open to opportunities badge */}
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent bg-accent-glow px-4 py-1.5 text-sm text-accent"
          role="status"
          aria-label="Employment status: Open to opportunities"
        >
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-success"
            aria-hidden="true"
          />
          Open to opportunities
        </div>

        <h1
          id="hero-heading"
          className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          I build systems that
          <br />
          <span className="text-text-muted">make operations work.</span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-text-muted sm:text-xl">
          Operations Performance Manager with 10+ years turning messy data into clear
          dashboards, manual processes into automated workflows, and scattered metrics
          into decisions that stick.
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-600 focus-visible:outline-accent"
          >
            Get in touch
            <span aria-hidden="true">→</span>
          </a>
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-7 py-3.5 font-medium text-foreground transition-all hover:border-text-muted hover:bg-surface-hover focus-visible:outline-accent"
          >
            See my work
          </a>
        </div>
      </div>
    </section>
  )
}
