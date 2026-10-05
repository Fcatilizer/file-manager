import { DEFAULT_RAIN, RAIN_DENSITIES, RAIN_DIRECTIONS, RAIN_LIMITS, type RainSettings } from '../../lib/rain'
import RainBackground from '../RainBackground'
import { ChoiceChips, RangeSetting, SwitchSetting } from './SettingsControls'
import '../../styles/rain-settings.css'

type Props = {
  enabled: boolean
  value?: RainSettings
  themeColor: string
  disabled: boolean
  onToggle: (enabled: boolean) => void
  onChange: (settings: RainSettings) => void
}

export default function RainSettingsPanel({ enabled, value = DEFAULT_RAIN, themeColor, disabled, onToggle, onChange }: Props) {
  const update = (patch: Partial<RainSettings>) => onChange({ ...value, ...patch })
  return (
    <section className="rain-settings" aria-label="Rain settings">
      <SwitchSetting label="Rain animation" checked={enabled} disabled={disabled} onChange={onToggle}
        description="Off by default. Animations respect reduced motion and pause in hidden tabs." />
      {enabled && (
        <>
          <div className="rain-settings__preview">
            <RainBackground enabled settings={value} preview />
            <span>Live preview</span>
          </div>
          <ChoiceChips label="Direction" value={value.direction} options={RAIN_DIRECTIONS} disabled={disabled}
            onChange={(direction) => update({ direction })} />
          <ChoiceChips label="Density" value={value.density} options={RAIN_DENSITIES} disabled={disabled}
            onChange={(density) => update({ density })} />
          <p className="rain-settings__hint">Light uses fewer drops. Turn off splashes for less rendering work. Mobile screens use fewer drops automatically.</p>
          <RangeSetting label="Speed" value={value.speed} {...RAIN_LIMITS.speed} unit="×" disabled={disabled} onChange={(speed) => update({ speed })} />
          <div className="rain-settings__dimensions">
            <RangeSetting label="Drop height" value={value.height} {...RAIN_LIMITS.height} unit=" px" disabled={disabled} onChange={(height) => update({ height })} />
            <RangeSetting label="Drop width" value={value.width} {...RAIN_LIMITS.width} unit=" px" disabled={disabled} onChange={(width) => update({ width })} />
          </div>
          <SwitchSetting label="Splash animation" checked={value.splash} disabled={disabled}
            description="Small ripples where drops reach the bottom edge." onChange={(splash) => update({ splash })} />
          <ChoiceChips label="Rain color" value={value.color === 'theme' ? 'theme' : 'custom'} disabled={disabled}
            options={[{ value: 'theme', label: 'Theme color' }, { value: 'custom', label: 'Custom color' }]}
            onChange={(mode) => update({ color: mode === 'theme' ? 'theme' : themeColor })} />
          {value.color !== 'theme' && (
            <label className="rain-settings__color">Custom rain color
              <input type="color" value={value.color} disabled={disabled} onChange={(event) => update({ color: event.target.value })} />
              <span>{value.color.toUpperCase()}</span>
            </label>
          )}
        </>
      )}
    </section>
  )
}
