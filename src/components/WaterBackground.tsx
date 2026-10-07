import { useRef, type CSSProperties } from 'react'
import { DEFAULT_WATER, WATER_COUNTS, type WaterSettings } from '../lib/water'
import { useSceneActivity } from './animations/useSceneActivity'
import '../styles/water-animation.css'

/** A bounded set of surface patches; ripple and petal motion share a wave clock. */
export default function WaterBackground({ settings = DEFAULT_WATER, preview = false }: { settings?: WaterSettings; preview?: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const active = useSceneActivity(sceneRef)
  const count = preview ? Math.ceil(WATER_COUNTS[settings.density] / 3) : WATER_COUNTS[settings.density]
  return <div ref={sceneRef} aria-hidden="true"
    className={`water-scene ${preview ? 'water-scene--preview' : 'water-background'}${active ? '' : ' water-scene--paused'}`}
    style={{ '--water-color': settings.color === 'theme' ? 'var(--accent)' : settings.color } as CSSProperties}>
    {Array.from({ length: count }, (_, index) => {
      const duration = (9 + index % 4 * 2) / settings.speed * (preview ? .7 : 1)
      return <div className="water-patch" key={index} style={{
        left: `${preview ? 18 + index % 2 * 58 : 5 + (index * 37 % 90)}%`,
        top: `${preview ? (Math.floor(index / 2) + .5) * 100 / Math.ceil(count / 2) : 8 + (index * 29 % 84)}%`,
        '--water-duration': `${duration}s`, '--water-drift-duration': `${duration * 3}s`,
        '--water-delay': `${-((index * 7 + 3) % 17) / 17 * duration}s`,
        '--water-ripple-size': `${settings.rippleSize * (preview ? .65 : 1) * (.8 + index % 3 * .15)}px`,
        '--water-petal-width': `${settings.width}px`, '--water-petal-height': `${settings.height}px`,
        '--water-petal-angle': `${index * 67 % 180 - 90}deg`,
      } as CSSProperties}>
        <span className="water-ring water-ring--outer" />
        <span className="water-ring water-ring--inner" />
        {settings.petals && <span className="water-petal-bob"><svg className="water-petal" viewBox="0 0 24 32" fill="currentColor">
          <path d="M12 30C3 24 0 14 3 6Q5 1 10 3L12 7L15 2Q21 1 22 7C25 17 19 26 12 30Z" />
          <path className="water-petal-vein" d="M12 27Q10 17 12 10" fill="none" stroke="currentColor" strokeWidth=".8" />
        </svg></span>}
      </div>
    })}
  </div>
}
