import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react'
import { useDocumentHidden } from './useDocumentHidden'

const motionQuery = '(prefers-reduced-motion: reduce)'
const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia(motionQuery)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const readMotion = () => window.matchMedia(motionQuery).matches

/** Also suspend previews that have scrolled out of the catalog or modal. */
export function useSceneActivity(ref: RefObject<HTMLElement | null>) {
  const hidden = useDocumentHidden()
  const reducedMotion = useSyncExternalStore(subscribeMotion, readMotion, () => true)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(entries => {
      // Fast focus/scroll changes can batch an exit and re-entry in one callback.
      const latest = entries.at(-1)
      if (latest) setVisible(latest.isIntersecting)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return !hidden && !reducedMotion && visible
}
