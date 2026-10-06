import { selectedAnimation, type Preferences, type AnimationKind } from '../lib/preferences'
import { ANIMATION_RENDERERS } from './animations/renderers'

/** The chooser previews and page background use the exact same renderers. */
export default function AnimationBackground({ preferences, kind = selectedAnimation(preferences), preview = false }: {
  preferences: Preferences; kind?: AnimationKind; preview?: boolean
}) {
  if (kind === 'none') return null
  const Renderer = ANIMATION_RENDERERS[kind]
  return <Renderer settings={preferences.animations.settings} preview={preview} />
}
