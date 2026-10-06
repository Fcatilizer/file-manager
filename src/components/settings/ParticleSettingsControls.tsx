import type { ReactNode } from 'react'
import { ANIMATION_DENSITIES, ANIMATION_DIRECTIONS, type AnimationAppearance, type AnimationLimits } from '../../lib/animationSettings'
import { ChoiceChips, RangeSetting } from './SettingsControls'

/** Shared controls; each effect owns its dimensions, defaults, and extra toggle. */
export default function ParticleSettingsControls({ value, limits, particle, themeColor, disabled, onChange, children }: {
  value: AnimationAppearance; limits: AnimationLimits; particle: 'Drop' | 'Leaf'; themeColor: string; disabled: boolean
  onChange: (patch: Partial<AnimationAppearance>) => void; children: ReactNode
}) {
  return <>
    <ChoiceChips label="Direction" value={value.direction} options={ANIMATION_DIRECTIONS} disabled={disabled} onChange={direction => onChange({ direction })} />
    <ChoiceChips label="Density" value={value.density} options={ANIMATION_DENSITIES} disabled={disabled} onChange={density => onChange({ density })} />
    <p className="animation-settings__hint">Light uses fewer particles. Smaller screens use fewer automatically.</p>
    <RangeSetting label="Speed" value={value.speed} {...limits.speed} unit="×" disabled={disabled} onChange={speed => onChange({ speed })} />
    <div className="animation-settings__dimensions">
      <RangeSetting label={`${particle} height`} value={value.height} {...limits.height} unit=" px" disabled={disabled} onChange={height => onChange({ height })} />
      <RangeSetting label={`${particle} width`} value={value.width} {...limits.width} unit=" px" disabled={disabled} onChange={width => onChange({ width })} />
    </div>
    {children}
    <ChoiceChips label="Animation color" value={value.color === 'theme' ? 'theme' : 'custom'} disabled={disabled}
      options={[{ value: 'theme', label: 'Theme color' }, { value: 'custom', label: 'Custom color' }]}
      onChange={mode => onChange({ color: mode === 'theme' ? 'theme' : themeColor })} />
    {value.color !== 'theme' && <label className="animation-settings__color">Custom animation color
      <input type="color" value={value.color} disabled={disabled} onChange={event => onChange({ color: event.target.value })} />
      <span>{value.color.toUpperCase()}</span>
    </label>}
  </>
}
