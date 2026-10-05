import { useId } from 'react'
import '../../styles/settings-controls.css'

type CommonProps = { label: string; disabled?: boolean }

export function ChoiceChips<T extends string>({ label, value, options, onChange, disabled }: CommonProps & {
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  const name = useId()
  return (
    <fieldset className="settings-field settings-chips" disabled={disabled}>
      <legend>{label}</legend>
      <div className="settings-chips__options">
        {options.map((option) => (
          <label className="settings-chip" key={option.value}>
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function RangeSetting({ label, value, min, max, step, unit = '', onChange, disabled }: CommonProps & {
  value: number; min: number; max: number; step: number; unit?: string
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div className="settings-field settings-range">
      <div><label htmlFor={id}>{label}</label><output htmlFor={id}>{value}{unit}</output></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        aria-valuetext={`${value}${unit}`} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  )
}

export function SwitchSetting({ label, description, checked, onChange, disabled }: CommonProps & {
  description?: string; checked: boolean; onChange: (checked: boolean) => void
}) {
  return (
    <label className="settings-switch">
      <span><strong>{label}</strong>{description && <small>{description}</small>}</span>
      <input type="checkbox" role="switch" aria-label={label} checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}
