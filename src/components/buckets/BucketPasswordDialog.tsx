import PasswordInput from '../PasswordInput'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Modal from '../Modal'
import { Icon } from '../Icon'
import { validateBucketPassword } from '../../lib/bucketProtection'
import '../../styles/bucket-protection.css'

type Props = {
  mode: 'unlock' | 'change'
  label: string
  onSubmit: (password: string, newPassword: string) => Promise<void>
  onClose: () => void
}
export default function BucketPasswordDialog({ mode, label, onSubmit, onClose }: Props) {
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const first = useRef<HTMLInputElement>(null)
  const change = mode === 'change'
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    first.current?.focus()
    return () => previous?.focus()
  }, [])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setError('')
    if (change) {
      const issue = validateBucketPassword(newPassword)
      if (issue) { setError(issue); return }
      if (newPassword !== confirmation) { setError('New passwords do not match'); return }
    }
    setBusy(true)
    try { await onSubmit(password, newPassword) } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not unlock bucket')
    } finally { setBusy(false) }
  }
  return (
    <Modal className="dialog" ariaLabel={change ? 'Change bucket password' : 'Unlock bucket'} onClose={onClose} closeOnBackdrop={!busy} closeOnEscape={!busy}>
      <form onSubmit={submit} className="bucket-dialog">
        <h2><Icon name="lock" size={18} />{change ? 'Change bucket password' : 'Unlock bucket'}</h2>
        <p className="dialog__message">{label}</p>
        <p className="dialog__message">{change ? 'Enter the current bucket password. Changing it locks this bucket on all devices.' : 'Your unlock lasts 15 minutes in this login session. This is the bucket password, not your account password.'}</p>
        <label className="auth__field"><span className="auth__label">{change ? 'Current bucket password' : 'Bucket password'}</span>
          <PasswordInput ref={first} className="auth__input" autoComplete="off" value={password} required disabled={busy} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {change && <>
          <label className="auth__field"><span className="auth__label">New bucket password</span><PasswordInput className="auth__input" autoComplete="new-password" minLength={12} required disabled={busy} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>
          <label className="auth__field"><span className="auth__label">Confirm new bucket password</span><PasswordInput className="auth__input" autoComplete="new-password" required disabled={busy} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>
        </>}
        {error && <p className="dialog__error" role="alert">{error}</p>}
        <div className="bucket-dialog__actions"><button type="button" className="btn btn--ghost" disabled={busy} onClick={onClose}>Cancel</button><button className="btn btn--primary" disabled={busy}>{busy ? 'Please wait…' : change ? 'Change password' : 'Unlock bucket'}</button></div>
      </form>
    </Modal>
  )
}
