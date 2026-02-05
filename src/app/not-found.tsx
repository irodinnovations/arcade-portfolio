'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ARCADE_URL } from '@/lib/constants'

export default function NotFound() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(ARCADE_URL)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background font-sans text-foreground">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-accent">404</h1>
        <p className="mb-2 text-xl text-text-muted">Page not found</p>
        <p className="mb-8 text-text-muted">
          But since you&apos;re here... want to play a game?
        </p>
        <div className="mb-8">
          <span className="text-4xl font-bold text-accent">{countdown}</span>
        </div>
        <p className="text-sm text-text-muted">
          Redirecting to arcade mode...
        </p>
        <a
          href={ARCADE_URL}
          className="mt-4 inline-block text-accent hover:underline focus-visible:outline-accent"
        >
          Go now →
        </a>
      </div>
    </div>
  )
}
