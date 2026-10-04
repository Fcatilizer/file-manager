import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import Modal from './Modal'
import { Icon } from './Icon'

type Props = {
  title: string
  label?: string
  placeholder?: string
  initialValue?: string
  confirmLabel?: string
  icon?: string
  description?: string
  danger?: boolean
  validate?: (value: string) => string | null
  onConfirm: (value: string) => void | Promise<void>
  onClose: () => void
}

/** Reusable single-input dialog (create folder, rename, etc.). */
export default function TextInputDialog({
  title,
  label,
  placeholder,
  initialValue = '',
  confirmLabel = 'Confirm',
  icon = 'check',
  description,
  danger = false,
  validate,
  onConfirm,
  onClose,
}: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    inputRef.current?.select()
    return () => { previousFocus?.focus() }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const trimmed = value.trim()
    const validationError = validate
      ? validate(trimmed)
      : trimmed
        ? null
        : 'This field is required'
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      await onConfirm(trimmed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose} className="dialog" closeOnBackdrop={!submitting} closeOnEscape={!submitting}>
      <form onSubmit={handleSubmit} onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('input:not(:disabled), button:not(:disabled)'))
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}>
        <div className="dialog__header">
          <span className={`dialog__icon${danger ? ' dialog__icon--danger' : ''}`}><Icon name={icon} size={16} /></span>
          <span className="dialog__title">{title}</span>
        </div>

        <div className="dialog__body">
          {description && <p className="dialog__message" id={`${inputId}-description`}>{description}</p>}
          {label && (
            <label className="dialog__label" htmlFor={inputId}>
              {label}
            </label>
          )}
          <input
            id={inputId}
            ref={inputRef}
            className="auth__input"
            value={value}
            placeholder={placeholder}
            disabled={submitting}
            autoComplete="off"
            spellCheck={false}
            aria-describedby={description ? `${inputId}-description` : undefined}
            aria-invalid={!!error}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(null)
            }}
          />
          {error && <div className="dialog__error" role="alert">{error}</div>}
        </div>

        <div className="dialog__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} disabled={submitting}>
            {submitting ? <span className="spinner spinner--sm" /> : <Icon name={icon} size={14} />}
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}
