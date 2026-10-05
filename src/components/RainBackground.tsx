import { useEffect, useState, type CSSProperties } from 'react'

// Deterministic spacing keeps the pattern stable through renders and theme changes.
const DROPS = Array.from({ length: 36 }, (_, index) => ({
  '--rain-position': (index + 0.5) / 36,
  '--rain-duration': `${6 + (index * 7 % 11) * 0.4}s`,
  '--rain-delay': `${-((index * 13 % 37) / 37) * 10}s`,
  '--rain-length': `${36 + (index * 17 % 55)}px`,
} as CSSProperties))

export default function RainBackground({ enabled }: { enabled: boolean }) {
  const [hidden, setHidden] = useState(() => document.hidden)

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  if (!enabled) return null

  return (
    <div className={`rain-background${hidden ? ' rain-background--paused' : ''}`} aria-hidden="true">
      {DROPS.map((style, index) => <span className="rain-background__drop" style={style} key={index} />)}
    </div>
  )
}
