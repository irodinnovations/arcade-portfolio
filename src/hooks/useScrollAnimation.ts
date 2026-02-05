'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

interface UseScrollAnimationReturn {
  ref: (node: HTMLElement | null) => void
  isVisible: boolean
}

export function useScrollAnimation(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback((node: HTMLElement | null) => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (node) {
      elementRef.current = node
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry?.isIntersecting) {
            setIsVisible(true)
            if (triggerOnce && observerRef.current) {
              observerRef.current.unobserve(node)
            }
          } else if (!triggerOnce) {
            setIsVisible(false)
          }
        },
        { threshold, rootMargin }
      )

      observerRef.current.observe(node)
    }
  }, [threshold, rootMargin, triggerOnce])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { ref, isVisible }
}
