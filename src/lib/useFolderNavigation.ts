import { useCallback, useEffect, useRef, useState } from 'react'

type FolderLocation = { bucket: string; prefix: string }

// Use native history so mouse back/forward buttons work even in browsers that
// reserve the auxiliary mouse events for browser navigation.
export function useFolderNavigation() {
  const [location, setLocation] = useState<FolderLocation>({ bucket: '', prefix: '' })
  const current = useRef(location)
  const session = useRef(crypto.randomUUID())

  useEffect(() => {
    const restore = (event: PopStateEvent) => {
      const entry = event.state?.vaultFolder
      if (entry?.session !== session.current || typeof entry.bucket !== 'string' || typeof entry.prefix !== 'string') return
      current.current = { bucket: entry.bucket, prefix: entry.prefix }
      setLocation(current.current)
    }
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])

  const navigate = useCallback((next: FolderLocation) => {
    const previous = current.current
    if (next.bucket === previous.bucket && next.prefix === previous.prefix) return
    const state = { ...window.history.state, vaultFolder: { ...next, session: session.current } }
    // The initial bucket selection establishes this page's first location.
    if (!previous.bucket) window.history.replaceState(state, '')
    else window.history.pushState(state, '')
    current.current = next
    setLocation(next)
  }, [])

  const setBucket = useCallback((value: string | ((current: string) => string)) => {
    const bucket = typeof value === 'function' ? value(current.current.bucket) : value
    if (bucket !== current.current.bucket) navigate({ bucket, prefix: '' })
  }, [navigate])
  const setPrefix = useCallback((prefix: string) => navigate({ ...current.current, prefix }), [navigate])

  return { bucket: location.bucket, prefix: location.prefix, setBucket, setPrefix }
}
