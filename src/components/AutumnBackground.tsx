import type { CSSProperties } from 'react'
import { AUTUMN_COUNTS, DEFAULT_AUTUMN, type AutumnSettings } from '../lib/autumn'
import { useDocumentHidden } from './animations/useDocumentHidden'
import '../styles/autumn-animation.css'

/** One reusable maple silhouette for falling leaves and the accumulated layer. */
function MapleLeaf() {
  return <svg className="autumn-leaf" viewBox="0 0 40 44" preserveAspectRatio="none" fill="none">
    <path d="m20 2 4 10 5-4-1 11 8-4-2 8 4 2-12 9-5-1-1 9-2-1 1-8-6 1-11-9 4-2-2-8 8 4-1-11 5 4Z"
      fill="currentColor" fillOpacity=".3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="m20 9 0 23m0-5-8-7m8 8 9-9m-9 3-4-6m4 5 4-5" stroke="currentColor" strokeWidth=".9" strokeLinecap="round" opacity=".7" />
  </svg>
}

/** A bounded CSS cycle: accumulate, lift, sweep, reset. No particles are appended over time. */
export default function AutumnBackground({ settings = DEFAULT_AUTUMN, preview = false }: { settings?: AutumnSettings; preview?: boolean }) {
  const hidden = useDocumentHidden()
  const count = preview ? Math.ceil(AUTUMN_COUNTS[settings.density] / 2) : AUTUMN_COUNTS[settings.density]
  const pileCount = preview ? count * 2 : count * 3
  const cycle = (preview ? 12 : 42) / settings.speed
  return <div aria-hidden="true" data-direction={settings.direction} data-breeze={settings.breeze}
    className={`autumn-scene ${preview ? 'autumn-scene--preview' : 'autumn-background'}${hidden ? ' autumn-scene--paused' : ''}`}
    style={{
      '--autumn-color': settings.color === 'theme' ? 'var(--accent)' : settings.color,
      '--autumn-cycle': `${cycle}s`, '--autumn-cycle-delay': `${-cycle * .25}s`,
      '--autumn-height': `${settings.height}px`, '--autumn-width': `${settings.width}px`,
    } as CSSProperties}>
    {Array.from({ length: count }, (_, index) => {
      const duration = (17 + index * 7 % 12) / settings.speed * (preview ? .42 : 1)
      return <span className="autumn-falling" key={index} style={{
        '--autumn-position': (index + .5) / count,
        '--autumn-fall-duration': `${duration}s`,
        '--autumn-fall-delay': `${-((index * 11 + 3) % 31) / 31 * duration}s`,
        '--autumn-flutter': `${(4 + index % 3) / settings.speed}s`,
        '--autumn-turn': `${index * 53 % 140 - 70}deg`,
        '--autumn-size': .7 + index % 4 * .1,
      } as CSSProperties}>
        <span className="autumn-flutter"><MapleLeaf /></span>
      </span>
    })}
    {settings.pile && <div className="autumn-pile">
      {Array.from({ length: pileCount }, (_, index) => <span className="autumn-pile-piece" key={index} style={{
        left: `${(index * 37 % pileCount) / pileCount * 100}%`,
        bottom: `${index % 3 * settings.height * .2 - 6}px`,
        '--autumn-turn': `${index * 71 % 220 - 110}deg`,
        '--autumn-size': .75 + index % 4 * .12,
        '--autumn-lift': `${-(35 + index * 23 % 140)}px`,
        '--autumn-spin': `${120 + index * 67 % 280}deg`,
      } as CSSProperties}><MapleLeaf /></span>)}
    </div>}
    {settings.breeze && <div className="autumn-gust">
      <svg viewBox="0 0 320 110" fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M3 77c54 2 87-41 133-38 38 3 40 42 13 46-20 3-28-19-12-26 20-9 42 20 80 11l100-28" strokeWidth="1.3" />
        <path d="M21 92c62 5 79-17 104-13m44-50c21-27 72-25 70 0-2 21-30 22-29 7 0-13 29-13 45-6l49 16" strokeWidth=".9" />
      </svg>
    </div>}
  </div>
}
