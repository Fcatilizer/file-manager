import { useId, useState, type ComponentPropsWithRef } from 'react'
import { Icon } from './Icon'
import '../styles/password-input.css'

type Props = Omit<ComponentPropsWithRef<'input'>, 'type'>

/** Shared password field; visibility is local to this instance and hidden initially. */
export default function PasswordInput({ id, className = '', disabled, ...props }: Props) {
  const generatedId = useId()
  const inputId = id || generatedId
  const [visible, setVisible] = useState(false)
  return (
    <span className="password-input">
      <input {...props} id={inputId} className={className} disabled={disabled} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-input__toggle"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-controls={inputId}
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </span>
  )
}
