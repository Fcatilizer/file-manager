import { useId } from 'react'
import { ACCENTS, ANIMATIONS, selectedAnimation, type Preferences } from '../../lib/preferences'
import { ANIMATION_CATALOG } from '../../lib/animationCatalog'
import type { AnimationAppearance } from '../../lib/animationSettings'
import AnimationBackground from '../AnimationBackground'
import ParticleSettingsControls from './ParticleSettingsControls'
import { SwitchSetting } from './SettingsControls'
import '../../styles/animation-settings.css'

export default function AnimationsPanel({ value, disabled, onChange }: { value: Preferences; disabled: boolean; onChange: (value: Preferences) => void }) {
  const name = useId()
  const selected = selectedAnimation(value)
  const themeColor = ACCENTS[value.accent][value.theme]
  const effect = selected === 'none' ? null : ANIMATION_CATALOG[selected]
  const settings = selected === 'none' ? null : value.animations.settings[selected]
  const updateSettings = (patch: Partial<AnimationAppearance> & Record<string, unknown>) => {
    if (selected === 'none' || !settings) return
    onChange({ ...value, animations: { ...value.animations, settings: { ...value.animations.settings, [selected]: { ...settings, ...patch } } } })
  }
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
    {effect && settings && <div className="animation-settings__controls">
      <h4 className="animation-settings__title">Default animation settings</h4>
      <p className="animation-settings__intro">Customize {effect.label.toLowerCase()}. Each style remembers its own settings.</p>
      <div className="animation-settings__preview" aria-label={`${effect.label} preview`}>
        <AnimationBackground preferences={value} preview />
        <span>Live preview</span>
      </div>
      <ParticleSettingsControls value={settings} limits={effect.limits} particle={effect.particle} themeColor={themeColor} disabled={disabled} onChange={updateSettings}>
        {effect.switches.map(option => <SwitchSetting key={option.key} label={option.label} checked={Reflect.get(settings, option.key) === true} disabled={disabled}
          description={option.description} onChange={checked => updateSettings({ [option.key]: checked })} />)}
        {effect.hint && <p className="animation-settings__hint">{effect.hint}</p>}
      </ParticleSettingsControls>
    </div>}
  </section>
}
