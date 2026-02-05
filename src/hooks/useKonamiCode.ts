'use client'

import { useEffect, useCallback, useRef } from 'react'
import { KONAMI_CODE, ARCADE_URL } from '@/lib/constants'

export function useKonamiCode(): void {
  const sequenceRef = useRef<string[]>([])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    sequenceRef.current = [...sequenceRef.current, event.code].slice(-KONAMI_CODE.length)

    if (sequenceRef.current.join(',') === KONAMI_CODE.join(',')) {
      window.location.href = ARCADE_URL
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
