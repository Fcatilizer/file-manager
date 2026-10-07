import WaterBackground from '../WaterBackground'
import type { ComponentType } from 'react'
import type { AnimationEffect, AnimationSettingsMap } from '../../lib/animationCatalog'
import RainBackground from '../RainBackground'
import LeafBackground from '../LeafBackground'
import AutumnBackground from '../AutumnBackground'
import SnowBackground from '../SnowBackground'
import StarfieldBackground from '../StarfieldBackground'

type Props = { settings: AnimationSettingsMap; preview: boolean }
/** Exhaustive map: adding a catalog entry requires its renderer here. */
export const ANIMATION_RENDERERS: Record<AnimationEffect, ComponentType<Props>> = {
  rain: ({ settings, preview }) => <RainBackground enabled settings={settings.rain} preview={preview} />,
  leaves: ({ settings, preview }) => <LeafBackground settings={settings.leaves} preview={preview} />,
  autumn: ({ settings, preview }) => <AutumnBackground settings={settings.autumn} preview={preview} />,
  snow: ({ settings, preview }) => <SnowBackground settings={settings.snow} preview={preview} />,
  water: ({ settings, preview }) => <WaterBackground settings={settings.water} preview={preview} />,
  starfield: ({ settings, preview }) => <StarfieldBackground settings={settings.starfield} preview={preview} />,
}
