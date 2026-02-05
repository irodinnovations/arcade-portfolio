'use client'

import { SOCIAL_LINKS } from '@/lib/professional'
import { ARCADE_URL } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10" role="contentinfo">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 sm:flex-row">
        <nav className="flex gap-6" aria-label="Social links">
          <a
            href={SOCIAL_LINKS.linkedin}
            className="text-sm text-text-muted transition-colors hover:text-foreground focus-visible:outline-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href={SOCIAL_LINKS.github}
            className="text-sm text-text-muted transition-colors hover:text-foreground focus-visible:outline-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href={SOCIAL_LINKS.substack}
            className="text-sm text-text-muted transition-colors hover:text-foreground focus-visible:outline-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Substack
          </a>
          {/* Easter egg link */}
          <a
            href={ARCADE_URL}
            className="text-sm transition-opacity hover:opacity-80 focus-visible:outline-accent"
            aria-label="Play the arcade version"
            title="Play the arcade version"
          >
            🕹️
          </a>
        </nav>
        <p className="text-sm text-text-muted">© 2026 Rodney John</p>
      </div>
    </footer>
  )
}
