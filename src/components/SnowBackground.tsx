import { useRef, type CSSProperties } from 'react'
import { DEFAULT_SNOW, SNOW_COUNTS, type SnowSettings } from '../lib/snow'
import { useSceneActivity } from './animations/useSceneActivity'
import '../styles/snow-animation.css'

/** Fixed flakes recycle; the shallow snowbank grows once and stays bounded. */
export default function SnowBackground({ settings = DEFAULT_SNOW, preview = false }: { settings?: SnowSettings; preview?: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const active = useSceneActivity(sceneRef)
  const count = preview ? Math.ceil(SNOW_COUNTS[settings.density] / 2) : SNOW_COUNTS[settings.density]
  return <div ref={sceneRef} aria-hidden="true" data-direction={settings.direction} data-glisten={settings.glisten}
    className={`snow-scene ${preview ? 'snow-scene--preview' : 'snow-background'}${active ? '' : ' snow-scene--paused'}`}
    style={{
      '--snow-color': settings.color === 'theme' ? 'var(--accent)' : settings.color,
      '--snow-floor': `${settings.accumulation ? settings.frostHeight * .3 : 0}px`,
      '--snow-bank-height': `${settings.frostHeight}px`,
      '--snow-build-duration': `${(preview ? 9 : 28) / settings.speed}s`,
      '--snow-build-delay': preview ? '-2s' : '0s',
    } as CSSProperties}>
    {Array.from({ length: count }, (_, index) => {
      const duration = (13 + index * 7 % 13) / settings.speed * (preview ? .4 : 1)
      const size = .55 + index % 4 * .2
      return <span className="snow-track" key={index} style={{
        '--snow-position': (index + .5) / count,
        '--snow-duration': `${duration}s`, '--snow-delay': `${-((index * 13 + 5) % 37) / 37 * duration}s`,
        '--snow-sway-duration': `${(3 + index % 4) / settings.speed}s`,
        '--snow-glint-duration': `${(2.5 + index % 5) / settings.speed}s`,
        '--snow-size-x': `${settings.width * size}px`, '--snow-size-y': `${settings.height * size}px`,
      } as CSSProperties}>
        <span className="snow-falling"><span className="snow-sway">
          <span className={`snow-flake ${index % 4 === 0 ? 'snow-flake--crystal' : ''}`}>
            {index % 4 === 0 && <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 1v18M2.2 5.5l15.6 9M2.2 14.5l15.6-9M7 3l3 3 3-3M7 17l3-3 3 3" />
            </svg>}
          </span>
        </span></span>
        {settings.accumulation && <span className="snow-settle" />}
      </span>
    })}
    {settings.accumulation && <div className="snow-bank">
      <svg viewBox="0 0 1000 60" preserveAspectRatio="none" fill="currentColor">
        <path d="M0 29Q70 13 140 28T290 25T440 24T590 26T750 22T900 25Q950 18 1000 29V60H0Z" opacity=".2" />
        <path d="M0 42Q100 21 200 38T380 34T570 36T770 33T1000 37V60H0Z" opacity=".38" />
        <path d="M0 42Q100 21 200 38T380 34T570 36T770 33T1000 37" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".45" />
      </svg>
    </div>}
  </div>
}
