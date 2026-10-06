import type { CSSProperties } from 'react'
import { DEFAULT_LEAVES, LEAF_COUNTS, type LeafSettings } from '../lib/leaves'
import { useDocumentHidden } from './animations/useDocumentHidden'
import '../styles/leaf-animation.css'

export default function LeafBackground({ settings = DEFAULT_LEAVES, preview = false }: { settings?: LeafSettings; preview?: boolean }) {
  const hidden = useDocumentHidden()
  const count = preview ? Math.ceil(LEAF_COUNTS[settings.density] / 2) : LEAF_COUNTS[settings.density]
  return <div aria-hidden="true" data-direction={settings.direction}
    className={`leaf-scene ${preview ? 'leaf-scene--preview' : 'leaf-background'}${hidden ? ' leaf-scene--paused' : ''}`}
    style={{ '--leaf-color': settings.color === 'theme' ? 'var(--accent)' : settings.color } as CSSProperties}>
    {Array.from({ length: count }, (_, index) => {
      const duration = (16 + index * 7 % 11) / settings.speed * (preview ? 0.5 : 1)
      return <span className="leaf-particle" key={index} style={{
        '--leaf-position': (index + 0.5) / count,
        '--leaf-duration': `${duration}s`,
        '--leaf-delay': `${-((index * 13 + 7) % 37) / 37 * duration}s`,
        '--leaf-sway-duration': `${(3 + index % 4) / settings.speed}s`,
        '--leaf-height': `${settings.height * (0.75 + index % 4 * 0.1)}px`,
        '--leaf-width': `${settings.width * (0.75 + index % 4 * 0.1)}px`,
        '--leaf-turn': `${index * 47 % 90 - 45}deg`,
      } as CSSProperties}>
        <span className="leaf-sway">
          <svg className="leaf-shape" viewBox="0 0 24 40" preserveAspectRatio="none" fill="none">
            <path d="M20 2C5 5 0 15 5 25c3 6 9 8 13 3C23 21 18 13 20 2Z" fill="currentColor" fillOpacity=".23" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6 37c2-12 5-20 11-29M10 23l-4-5m7-2 4-2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </span>
      </span>
    })}
    {settings.breeze && Array.from({ length: preview ? 2 : 3 }, (_, index) => <span className="leaf-breeze" key={index} style={{
      '--breeze-top': `${22 + index * 27}%`,
      '--breeze-duration': `${(14 + index * 3) / settings.speed * (preview ? 0.6 : 1)}s`,
      '--breeze-delay': `${-(index * 4 + 3) / settings.speed}s`,
    } as CSSProperties}>
      <svg viewBox="0 0 200 65" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M3 39c36 0 45-24 78-24 29 0 29 31 7 31-13 0-16-13-5-18 11-5 30 10 54 10h58M30 51c35 0 50-3 68 2 21 6 43 5 61 1" />
      </svg>
    </span>)}
  </div>
}
