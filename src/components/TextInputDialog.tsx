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
    inputRef.current?.focus()
    inputRef.current?.select()
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
    <Modal onClose={onClose} className="dialog">
      <form onSubmit={handleSubmit}>
        <div className="dialog__header">
          <span className="dialog__icon"><Icon name={icon} size={16} /></span>
          <span className="dialog__title">{title}</span>
        </div>

        <div className="dialog__body">
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
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(null)
            }}
          />
          {error && <div className="dialog__error">{error}</div>}
        </div>

        <div className="dialog__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? <span className="spinner spinner--sm" /> : <Icon name={icon} size={14} />}
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}
