'use client'

import { useKonamiCode } from '@/hooks/useKonamiCode'

export function KonamiProvider({ children }: { children: React.ReactNode }) {
  useKonamiCode()
  return <>{children}</>
}
