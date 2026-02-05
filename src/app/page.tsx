'use client'

import { useEffect } from 'react'
import {
  Hero,
  Stats,
  Capabilities,
  Projects,
  Timeline,
  Contact,
  Navigation,
  Footer,
  SkipLink,
} from '@/components/professional'
import { useKonamiCode } from '@/hooks/useKonamiCode'

export default function HomePage() {
  // Initialize Konami code Easter egg
  useKonamiCode()

  // Apply theme on mount
  useEffect(() => {
    // Theme is handled by the inline script in layout, but we can also check here
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SkipLink />
      <Navigation />
      <main id="main-content">
        <Hero />
        <Stats />
        <Capabilities />
        <Projects />
        <Timeline />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
