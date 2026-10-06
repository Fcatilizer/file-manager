import { useEffect, useRef, type CSSProperties } from 'react'
import { DEFAULT_STARFIELD, STAR_COUNTS, meteorDelay, starfieldParallax, type StarfieldSettings } from '../lib/starfield'
import { useSceneActivity } from './animations/useSceneActivity'
import '../styles/starfield-animation.css'

/** Three fixed star layers and one reusable meteor; nothing accumulates over time. */
export default function StarfieldBackground({ settings = DEFAULT_STARFIELD, preview = false }: { settings?: StarfieldSettings; preview?: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const meteorRef = useRef<HTMLSpanElement>(null)
  const active = useSceneActivity(sceneRef)
  const count = preview ? Math.ceil(STAR_COUNTS[settings.density] / 2) : STAR_COUNTS[settings.density]

  // Update one CSS variable per scroll frame, not React state or a continuous loop.
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (!active || !settings.parallax) {
      scene.style.setProperty('--starfield-scroll', '0px')
      return
    }
    const scroller = preview ? scene.closest('.account-settings__body') : null
    const target = scroller || window
    let frame = 0
    const update = () => {
      frame = 0
      scene.style.setProperty('--starfield-scroll', `${starfieldParallax(scroller?.scrollTop ?? window.scrollY, settings.parallax)}px`)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    target.addEventListener('scroll', schedule, { passive: true })
    return () => { target.removeEventListener('scroll', schedule); cancelAnimationFrame(frame) }
  }, [active, preview, settings.parallax])

  // A single timer schedules random passes; the browser animates each short trail.
  useEffect(() => {
    const scene = sceneRef.current, meteor = meteorRef.current
    if (!active || !settings.shootingStars || !scene || !meteor) return
    let timer: ReturnType<typeof setTimeout>
    let pass: Animation | undefined
    let cancelled = false
    const launch = () => {
      if (cancelled) return
      const angle = 26 + Math.random() * 16
      const distance = scene.clientWidth * (0.55 + Math.random() * 0.25)
      const duration = (1050 + Math.random() * 450) / settings.meteorSpeed
      meteor.style.left = `${8 + Math.random() * 36}%`
      meteor.style.top = `${8 + Math.random() * 32}%`
      meteor.style.setProperty('--meteor-angle', `${angle}deg`)
      pass = meteor.animate([
        { transform: 'translate3d(0, 0, 0)', opacity: 0 },
        { offset: 0.12, opacity: 0.85 },
        { offset: 0.7, opacity: 0.7 },
        { transform: `translate3d(${distance}px, ${distance * Math.tan(angle * Math.PI / 180)}px, 0)`, opacity: 0 },
      ], { duration, easing: 'linear' })
      pass.onfinish = () => {
        if (!cancelled) timer = setTimeout(launch, Math.max(400, meteorDelay(settings.meteorFrequency, Math.random(), preview) - duration))
      }
    }
    timer = setTimeout(launch, meteorDelay(settings.meteorFrequency, Math.random(), preview) * 0.35)
    return () => { cancelled = true; clearTimeout(timer); pass?.cancel() }
  }, [active, preview, settings.shootingStars, settings.meteorFrequency, settings.meteorSpeed])

  return <div ref={sceneRef} aria-hidden="true"
    className={`starfield-scene ${preview ? 'starfield-scene--preview' : 'starfield-background'}${active ? '' : ' starfield-scene--paused'}`}
    style={{ '--starfield-color': settings.color === 'theme' ? 'var(--accent)' : settings.color } as CSSProperties}>
    {[0, 1, 2].map(layer => <div className="starfield-layer" key={layer} style={{ '--star-depth': 0.2 + layer * 0.35 } as CSSProperties}>
      {Array.from({ length: Math.ceil(count / 3) }, (_, index) => {
        const seed = index * 3 + layer + 1
        const period = (3.5 + seed * 7 % 55 / 10) / settings.speed
        return <span className="starfield-star" key={index} style={{
          left: `${(seed * 0.61803398875 % 1) * 100}%`, top: `${(seed * seed * 0.41421356237 % 1) * 100}%`,
          width: `${settings.width * (0.55 + layer * 0.22 + index % 3 * 0.12)}px`,
          height: `${settings.height * (0.55 + layer * 0.22 + index % 3 * 0.12)}px`,
          '--star-duration': `${period}s`, '--star-delay': `${-(seed * 13 % 37) / 37 * period}s`,
        } as CSSProperties} />
      })}
    </div>)}
    {settings.shootingStars && <span className="starfield-meteor" ref={meteorRef}><span className="starfield-meteor__trail" /></span>}
  </div>
}
