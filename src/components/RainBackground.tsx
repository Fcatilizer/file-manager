import { useEffect, useState, type CSSProperties } from 'react'
import { DEFAULT_RAIN, RAIN_DENSITIES, type RainSettings } from '../lib/rain'
import '../styles/rain-animation.css'

type Props = { enabled: boolean; settings?: RainSettings; preview?: boolean }

/** CSS-only animation: no frame loop, canvas, timers or third-party engine. */
export default function RainBackground({ enabled, settings = DEFAULT_RAIN, preview = false }: Props) {
  const [hidden, setHidden] = useState(() => document.hidden)

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  if (!enabled) return null
  const density = RAIN_DENSITIES.find((option) => option.value === settings.density)!
  const count = preview ? Math.ceil(density.count / 2) : density.count
  const sceneStyle = {
    '--rain-color': settings.color === 'theme' ? 'var(--accent)' : settings.color,
    '--rain-width': `${settings.width}px`,
  } as CSSProperties

  return (
    <div className={`rain-scene ${preview ? 'rain-scene--preview' : 'rain-background'}${hidden ? ' rain-scene--paused' : ''}`}
      data-direction={settings.direction} style={sceneStyle} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const duration = (6 + (index * 7 % 11) * 0.4) / settings.speed * (preview ? 0.55 : 1)
        const style = {
          '--rain-position': (index + 0.5) / count,
          '--rain-duration': `${duration}s`,
          '--rain-delay': `${-((index * 13 % 37) / 37) * duration}s`,
          '--rain-length': `${settings.height * (0.7 + (index * 17 % 31) / 100)}px`,
        } as CSSProperties
        return (
          <span className="rain-particle" style={style} key={index}>
            <span className="rain-drop" />
            {settings.splash && <span className="rain-splash" />}
          </span>
        )
      })}
    </div>
  )
}
