import { useId, useState } from 'react'
import CopyButton from './CopyButton'
import '../styles/copy-field.css'

export default function CopyField({ value, label }: { value: string; label: string }) {
  const id = useId()
  const [error, setError] = useState('')
  return <div className="copy-field">
    <label className="auth__label" htmlFor={id}>{label}</label>
    <div className="copy-field__control">
      <input id={id} className="auth__input" readOnly value={value} onFocus={(event) => event.target.select()} />
      <CopyButton value={value} className="copy-field__button" onError={setError} />
    </div>
    {error && <p className="dialog__error" role="alert">{error}</p>}
  </div>
}
