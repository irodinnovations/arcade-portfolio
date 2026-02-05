'use client'

import { CONTACT_EMAIL } from '@/lib/professional'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import clsx from 'clsx'

export function Contact() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      ref={ref}
      id="contact"
      className={clsx(
        'border-t border-border px-6 py-24 text-center transition-all delay-200 duration-700',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="contact-heading"
          className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Let&apos;s build something.
        </h2>
        <p className="mb-8 text-lg text-text-muted">
          Currently open to operations, analytics, and product roles.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-600 focus-visible:outline-accent"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </section>
  )
}
