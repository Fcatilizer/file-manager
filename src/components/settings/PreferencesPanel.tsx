import { ACCENTS, FONTS, type Preferences } from '../../lib/preferences'
import { ChoiceChips } from './SettingsControls'
import AnimationsPanel from './AnimationsPanel'

type Props = { value: Preferences; onChange: (value: Preferences) => void; disabled: boolean }

export default function PreferencesPanel({ value, onChange, disabled }: Props) {
  return (
    <>
      <ChoiceChips label="Theme" value={value.theme} disabled={disabled}
        options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
        onChange={(theme) => onChange({ ...value, theme })} />
      <div className="auth__field">
        <label className="auth__label" htmlFor="account-font">Interface font</label>
        <select id="account-font" className="auth__input" value={value.font} disabled={disabled}
          onChange={(event) => onChange({ ...value, font: event.target.value as Preferences['font'] })}>
          {Object.entries(FONTS).map(([id, font]) => <option key={id} value={id}>{font.label}</option>)}
        </select>
      </div>
      <fieldset className="account-settings__accents" disabled={disabled}>
        <legend className="auth__label">Accent color</legend>
        {Object.entries(ACCENTS).map(([id, accent]) => (
          <label key={id} className="account-settings__swatch">
            <input type="radio" name="accent" value={id} checked={value.accent === id}
              onChange={() => onChange({ ...value, accent: id as Preferences['accent'] })} />
            <span style={{ background: accent[value.theme] }} />{accent.label}
          </label>
        ))}
      </fieldset>
      <AnimationsPanel value={value} disabled={disabled} onChange={onChange} />
    </>
  )
}
