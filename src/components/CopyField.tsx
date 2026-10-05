import { useId, useState } from 'react'
import { Icon } from './Icon'
import '../styles/copy-field.css'

export default function CopyField({ value, label }: { value: string; label: string }) {
  const id = useId()
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const [error, setError] = useState('')
  const copied = copiedValue === value
  const copy = async () => {
    setError('')
    try { await navigator.clipboard.writeText(value); setCopiedValue(value) }
    catch { setError('Could not copy. Select the URL and copy it manually.') }
  }
  return <div className="copy-field">
    <label className="auth__label" htmlFor={id}>{label}</label>
    <div className="copy-field__control">
      <input id={id} className="auth__input" readOnly value={value} onFocus={(event) => event.target.select()} />
      <button type="button" className="btn btn--icon copy-field__button" aria-label={copied ? 'Link copied' : 'Copy link'} title={copied ? 'Copied' : 'Copy link'} onClick={() => void copy()}>
        <Icon name={copied ? 'check' : 'copy'} size={16} />
      </button>
    </div>
    <span className="copy-field__status" role="status">{copied ? 'Link copied' : ''}</span>
    {error && <p className="dialog__error" role="alert">{error}</p>}
  </div>
}
