import { useId } from 'react'
import { ACCENTS, ANIMATIONS, selectedAnimation, type Preferences } from '../../lib/preferences'
import { RAIN_LIMITS } from '../../lib/rain'
import { LEAF_LIMITS } from '../../lib/leaves'
import AnimationBackground from '../AnimationBackground'
import ParticleSettingsControls from './ParticleSettingsControls'
import { SwitchSetting } from './SettingsControls'
import '../../styles/animation-settings.css'

export default function AnimationsPanel({ value, disabled, onChange }: { value: Preferences; disabled: boolean; onChange: (value: Preferences) => void }) {
  const name = useId()
  const selected = selectedAnimation(value)
  const themeColor = ACCENTS[value.accent][value.theme]
  const rain = value.animations.settings.rain
  const leaves = value.animations.settings.leaves
  const updateSettings = (settings: Partial<Preferences['animations']['settings']>) => onChange({ ...value, animations: { ...value.animations, settings: { ...value.animations.settings, ...settings } } })
  return <section className="animation-settings" aria-label="Animations">
    <fieldset className="animation-picker" disabled={disabled}>
      <legend>Animations</legend>
      <p className="animation-settings__intro">Choose a little atmosphere. Preview each style, or keep things still.</p>
      <div className="animation-picker__grid">
        {ANIMATIONS.map(option => <label className="animation-card" key={option.value}>
          <input type="radio" name={name} value={option.value} checked={selected === option.value}
            aria-label={option.label} onChange={() => onChange({ ...value, animations: { ...value.animations, type: option.value } })} />
          <span className="animation-card__surface">
            <span className="animation-card__preview" aria-hidden="true">
              <span className="animation-card__horizon" />
              <AnimationBackground preferences={value} kind={option.value} preview />
              {option.value === 'none' && <span className="animation-card__still">◆</span>}
            </span>
            <span className="animation-card__label">{option.label}<span className="animation-card__check" aria-hidden="true">✓</span></span>
            <span className="animation-card__description">{option.description}</span>
          </span>
        </label>)}
      </div>
    </fieldset>
    <p className="animation-settings__motion">Off by default. Effects pause in hidden tabs and respect reduced motion.</p>
    <p className="animation-settings__reduced">Reduced motion is on: previews are still and background effects are hidden.</p>
    {selected !== 'none' && <div className="animation-settings__controls">
      <h4 className="animation-settings__title">Default animation settings</h4>
      <p className="animation-settings__intro">Customize {selected === 'rain' ? 'rain' : 'falling leaves'}. Each style remembers its own settings.</p>
      <div className="animation-settings__preview" aria-label={`${selected === 'rain' ? 'Rain' : 'Falling leaves'} preview`}>
        <AnimationBackground preferences={value} preview />
        <span>Live preview</span>
      </div>
      {selected === 'rain' ? <ParticleSettingsControls value={rain} limits={RAIN_LIMITS} particle="Drop" themeColor={themeColor} disabled={disabled}
        onChange={patch => updateSettings({ rain: { ...rain, ...patch } })}>
        <SwitchSetting label="Splash" checked={rain.splash} disabled={disabled} description="Small ripples where drops meet the bottom edge."
          onChange={splash => updateSettings({ rain: { ...rain, splash } })} />
      </ParticleSettingsControls> : <ParticleSettingsControls value={leaves} limits={LEAF_LIMITS} particle="Leaf" themeColor={themeColor} disabled={disabled}
        onChange={patch => updateSettings({ leaves: { ...leaves, ...patch } })}>
        <SwitchSetting label="Breeze" checked={leaves.breeze} disabled={disabled} description="Delicate wind trails drift between the falling leaves."
          onChange={breeze => updateSettings({ leaves: { ...leaves, breeze } })} />
      </ParticleSettingsControls>}
    </div>}
  </section>
}
