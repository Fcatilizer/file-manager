import { selectedAnimation, type Preferences, type AnimationKind } from '../lib/preferences'
import RainBackground from './RainBackground'
import LeafBackground from './LeafBackground'

/** The chooser previews and page background use the exact same renderers. */
export default function AnimationBackground({ preferences, kind = selectedAnimation(preferences), preview = false }: {
  preferences: Preferences; kind?: AnimationKind; preview?: boolean
}) {
  if (kind === 'rain') return <RainBackground enabled settings={preferences.rainSettings} preview={preview} />
  if (kind === 'leaves') return <LeafBackground settings={preferences.leafSettings} preview={preview} />
  return null
}
