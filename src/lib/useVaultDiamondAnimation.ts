import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook managing the diamond spring-spin animation timing and key state.
 */
export function useVaultDiamondAnimation(durationMs = 750) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const triggerAnimation = useCallback(() => {
    setAnimKey((k) => k + 1)
    setIsAnimating(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsAnimating(false)
    }, durationMs)
  }, [durationMs])

  return { isAnimating, animKey, triggerAnimation }
}
