import PasswordInput from '../PasswordInput'
import { useState, type FormEvent } from 'react'
import Modal from '../Modal'
import { ChoiceChips } from '../settings/SettingsControls'
import { validateBucketName } from '../../lib/buckets'
import { validateBucketPassword } from '../../lib/bucketProtection'
import '../../styles/bucket-protection.css'

type Props = { canCreateShared: boolean; onClose: () => void; onCreate: (name: string, isPrivate: boolean, password?: string) => Promise<void> }
export default function CreateBucketDialog({ canCreateShared, onClose, onCreate }: Props) {
  const [kind, setKind] = useState<'private' | 'shared'>('private')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    const issue = validateBucketName(name.trim()) || (kind === 'private' ? validateBucketPassword(password) : null)
    if (issue) { setError(issue); return }
    if (kind === 'private' && password !== confirmation) { setError('Passwords do not match'); return }
    setError(''); setBusy(true)
    try { await onCreate(name.trim(), kind === 'private', kind === 'private' ? password : undefined) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not create bucket') }
    finally { setBusy(false) }
  }
  return (
    <Modal className="dialog" ariaLabel="Create bucket" onClose={onClose} closeOnBackdrop={!busy} closeOnEscape={!busy}>
      <form className="bucket-dialog" onSubmit={submit}>
        <h2>Create bucket</h2>
        {canCreateShared && <ChoiceChips label="Access" value={kind} onChange={setKind} disabled={busy} options={[{ value: 'private', label: 'Only me' }, { value: 'shared', label: 'Shared vault' }]} />}
        <p className="dialog__message">{kind === 'private' ? 'Only you can access this bucket in Vault. Keep the password safe: there is no admin reset.' : 'Everyone signed in to this vault can access this bucket.'}</p>
        <label className="auth__field"><span className="auth__label">Bucket name</span><input className="auth__input" autoFocus autoComplete="off" placeholder="personal-documents" value={name} onChange={(e) => setName(e.target.value)} required disabled={busy} maxLength={63} /></label>
        {kind === 'private' && <>
          <label className="auth__field"><span className="auth__label">Bucket password</span><PasswordInput className="auth__input" autoComplete="new-password" placeholder="At least 12 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} disabled={busy} /></label>
          <label className="auth__field"><span className="auth__label">Confirm bucket password</span><PasswordInput className="auth__input" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required disabled={busy} /></label>
        </>}
        {error && <p className="dialog__error" role="alert">{error}</p>}
        <div className="bucket-dialog__actions"><button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>Cancel</button><button className="btn btn--primary" disabled={busy}>{busy ? 'Creating…' : kind === 'private' ? 'Create private bucket' : 'Create shared bucket'}</button></div>
      </form>
    </Modal>
  )
}
