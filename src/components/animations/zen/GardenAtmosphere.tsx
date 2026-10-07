import type { CSSProperties } from 'react'
import { ZEN_COUNTS, type ZenSettings } from '../../../lib/zen'

/** Viewport-sized wind and leaves; fixed counts keep long-running scenes bounded. */
export default function GardenAtmosphere({ settings, preview }: { settings: ZenSettings; preview: boolean }) {
  const count = preview ? Math.ceil(ZEN_COUNTS[settings.density] / 2) : ZEN_COUNTS[settings.density]
  return <div className="zen-atmosphere">
    {settings.bonsai && Array.from({ length: count }, (_, index) => <span key={`leaf-${index}`} className="zen-air-leaf" style={{
      top: `${5 + index * 19 % 74}%`, width: `${settings.width * 4}px`, height: `${settings.height * 2}px`,
      '--zen-flight-time': `${(22 + index % 4 * 4) / settings.speed}s`,
      '--zen-delay': `${-(index * 6 + 5) / settings.speed}s`,
    } as CSSProperties}><i /></span>)}
    {settings.motes && <>
      {Array.from({ length: count }, (_, index) => <span key={index} className="zen-mote" style={{
        left: `${7 + index * 31 % 87}%`, top: `${8 + index * 17 % 82}%`,
        width: `${settings.width}px`, height: `${settings.height}px`,
        '--zen-mote-time': `${(10 + index % 5) / settings.speed}s`, '--zen-delay': `${-(index * 4 + 3) / settings.speed}s`,
      } as CSSProperties} />)}
      {[0, 1, 2].map(index => <svg key={`wind-${index}`} className="zen-wind" viewBox="0 0 240 60" fill="none" style={{
        top: `${17 + index * 29}%`, left: `${index * 23 - 10}%`, '--zen-delay': `${-(index * 6) / settings.speed}s`,
      } as CSSProperties}>
        <path pathLength="100" d="M0 39C65 39 76 12 126 17S175 51 205 32C235 13 206 0 196 16M38 51C90 51 112 29 159 40" />
      </svg>)}
    </>}
  </div>
}
