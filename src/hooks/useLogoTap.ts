'use client'

import { useRef, useCallback } from 'react'
import { ARCADE_URL } from '@/lib/constants'

const TAP_THRESHOLD = 5
const TAP_TIMEOUT_MS = 2000

interface UseLogoTapReturn {
  handleLogoClick: () => void
  tapCount: React.MutableRefObject<number>
}

export function useLogoTap(): UseLogoTapReturn {
  const tapCount = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogoClick = useCallback(() => {
    tapCount.current += 1

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (tapCount.current >= TAP_THRESHOLD) {
      window.location.href = ARCADE_URL
      return
    }

    timeoutRef.current = setTimeout(() => {
      tapCount.current = 0
    }, TAP_TIMEOUT_MS)
  }, [])

  return { handleLogoClick, tapCount }
}
