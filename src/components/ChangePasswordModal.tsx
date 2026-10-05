import { useState, type FormEvent } from 'react'
import { Icon } from './Icon'
import Modal, { ModalCloseButton } from './Modal'
import { changePassword, adminResetPassword, type SessionUser } from '../lib/api'

type Props = {
  currentUser: SessionUser
  targetUser?: SessionUser // If provided and targetUser.id !== currentUser.id, admin reset mode
  onClose: () => void
  onToast: (message: string, type?: 'success' | 'error') => void
}

export default function ChangePasswordModal({
  currentUser,
  targetUser,
  onClose,
  onToast,
}: Props) {
  const isSelf = !targetUser || targetUser.id === currentUser.id
  const targetEmail = targetUser?.email || currentUser.email

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isSelf && !currentPassword) {
      setError('Please enter your current password')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (isSelf && currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    setSubmitting(true)
    try {
      if (isSelf) {
        await changePassword(currentPassword, newPassword)
        onToast('Password updated successfully')
      } else {
        await adminResetPassword(targetUser.id, newPassword)
        onToast(`Password reset for ${targetEmail}`)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose} className="password-modal" closeOnBackdrop={!submitting} closeOnEscape={!submitting}>
      <div className="password-modal__header">
        <div className="password-modal__title">
          <div className="password-modal__icon">
            <Icon name="key" size={18} />
          </div>
          <div>
            <h3>{isSelf ? 'Change Password' : 'Reset User Password'}</h3>
            <p className="password-modal__sub">{targetEmail}</p>
          </div>
        </div>
        <ModalCloseButton onClose={onClose} disabled={submitting} label="Close password settings" />
      </div>

      <form onSubmit={handleSubmit} className="password-modal__form">
        {error && (
          <div className="auth__error" role="alert">
            {error}
          </div>
        )}

        {isSelf && (
          <div className="auth__field">
            <label className="auth__label">Current Password</label>
            <div className="password-input-wrap">
              <input
                className="auth__input"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrent((v) => !v)}
                title={showCurrent ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <Icon name={showCurrent ? 'eyeOff' : 'eye'} size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="auth__field">
          <label className="auth__label">New Password</label>
          <div className="password-input-wrap">
            <input
              className="auth__input"
              type={showNew ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus={!isSelf}
              required
              minLength={8}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowNew((v) => !v)}
              title={showNew ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              <Icon name={showNew ? 'eyeOff' : 'eye'} size={15} />
            </button>
          </div>
        </div>

        <div className="auth__field">
          <label className="auth__label">Confirm New Password</label>
          <div className="password-input-wrap">
            <input
              className="auth__input"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirm((v) => !v)}
              title={showConfirm ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              <Icon name={showConfirm ? 'eyeOff' : 'eye'} size={15} />
            </button>
          </div>
        </div>

        {newPassword && confirmPassword && (
          <div className={`password-match-hint ${newPassword === confirmPassword ? 'match' : 'mismatch'}`}>
            <Icon name={newPassword === confirmPassword ? 'check' : 'close'} size={12} />
            <span>{newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}</span>
          </div>
        )}

        <div className="password-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner spinner--sm" /> Updating…
              </>
            ) : (
              <>
                <Icon name="key" size={14} /> Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
