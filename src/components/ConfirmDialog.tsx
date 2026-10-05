import { useState } from 'react'
import Modal, { ModalCloseButton } from './Modal'
import { Icon } from './Icon'

type Props = {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  icon?: string
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

/** Reusable confirmation dialog (delete, destructive actions, etc.). */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  icon = 'trash',
  onConfirm,
  onClose,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (busy) return
    setBusy(true)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose} className="dialog" closeOnBackdrop={!busy} closeOnEscape={!busy}>
      <div className="dialog__header">
        <span className={`dialog__icon${danger ? ' dialog__icon--danger' : ''}`}>
          <Icon name={icon} size={16} />
        </span>
        <span className="dialog__title">{title}</span>
        <ModalCloseButton onClose={onClose} disabled={busy} />
      </div>

      <div className="dialog__body">
        <p className="dialog__message">{message}</p>
        {error && <div className="dialog__error">{error}</div>}
      </div>

      <div className="dialog__footer">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
          onClick={handleConfirm}
          disabled={busy}
        >
          {busy ? <span className="spinner spinner--sm" /> : <Icon name={icon} size={14} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
