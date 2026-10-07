import { useRef, type CSSProperties } from 'react'
import { DEFAULT_ZEN, type ZenSettings } from '../lib/zen'
import { useSceneActivity } from './animations/useSceneActivity'
import { Bonsai, GardenLantern, GardenRocks, RakedSand } from './animations/zen/GardenElements'
import GardenAtmosphere from './animations/zen/GardenAtmosphere'
import '../styles/zen-garden-animation.css'
import '../styles/zen-garden-motion.css'

export default function ZenGardenBackground({ settings = DEFAULT_ZEN, preview = false }: { settings?: ZenSettings; preview?: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const active = useSceneActivity(sceneRef)
  return <div ref={sceneRef} aria-hidden="true" className={`zen-scene ${preview ? 'zen-scene--preview' : 'zen-background'}${active ? '' : ' zen-scene--paused'}`}
    style={{ '--zen-color': settings.color === 'theme' ? 'var(--accent)' : settings.color,
      '--zen-requested-height': `${settings.sceneHeight}px`, '--zen-sway-time': `${7 / settings.speed}s`, '--zen-glow-time': `${5 / settings.speed}s`,
      '--zen-scene-scale': settings.sceneHeight / 170,
      '--zen-cycle-time': `${32 / settings.speed}s`, '--zen-wind-time': `${14 / settings.speed}s`, '--zen-sand-time': `${18 / settings.speed}s`,
    } as CSSProperties}>
    <GardenAtmosphere settings={settings} preview={preview} />
    <div className="zen-ground">
      {settings.sand && <RakedSand />}
      {settings.bonsai && <Bonsai />}
      {settings.rocks && <GardenRocks />}
      {settings.lantern && <GardenLantern />}
    </div>
  </div>
}
