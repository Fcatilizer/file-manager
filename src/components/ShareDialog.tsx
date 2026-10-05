import { useEffect, useState } from 'react'
import Modal, { ModalHeader } from './Modal'
import CopyField from './CopyField'
import { ChoiceChips } from './settings/SettingsControls'
import { createShare, listShares, revokeShare, type PublicShare } from '../lib/api'
import '../styles/share-dialog.css'

type Props = { bucket: string; item: { key: string; name: string; isFolder: boolean }; isPrivate: boolean; onClose: () => void }
export default function ShareDialog({ bucket, item, isPrivate, onClose }: Props) {
  const [duration, setDuration] = useState('24h')
  const [hours, setHours] = useState('48')
  const [shares, setShares] = useState<PublicShare[]>([])
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let live = true
    listShares(bucket, item.key).then((data) => { if (live) setShares(data) }).catch((e) => { if (live) setError(e.message) })
    return () => { live = false }
  }, [bucket, item.key])
  const create = async () => {
    setBusy(true); setError('')
    try {
      const share = await createShare(bucket, item.key, item.isFolder, duration, Number(hours))
      setShares((current) => [share, ...current]); setUrl(new URL(share.path, window.location.origin).href)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not create link') }
    finally { setBusy(false) }
  }
  const revoke = async (id: string) => {
    setBusy(true); setError('')
    try { await revokeShare(id); setShares((current) => current.filter((s) => s.id !== id)); setUrl('') }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not revoke link') }
    finally { setBusy(false) }
  }
  return <Modal ariaLabel="Share publicly" className="dialog" onClose={onClose} closeOnBackdrop={!busy} closeOnEscape={!busy}>
    <div className="share-dialog">
      <ModalHeader onClose={onClose} disabled={busy} label="Close sharing"><h2>Share publicly</h2></ModalHeader>
      <p className="dialog__message">{item.name}</p>
      <p className="dialog__message">Anyone with this link can download {item.isFolder ? 'this folder’s current and future contents' : 'this file'} without signing in. Your display name (or email username) is shown to recipients.{isPrivate ? ' This grants public access to this item even when your private bucket is locked.' : ''}</p>
      <ChoiceChips label="Link expires" value={duration} onChange={setDuration} disabled={busy} options={[{value:'1h',label:'1 hour'},{value:'6h',label:'6 hours'},{value:'24h',label:'24 hours'},{value:'custom',label:'Custom'},{value:'permanent',label:'Permanent'}]} />
      {duration === 'custom' && <label className="auth__field"><span className="auth__label">Expires in hours</span><input className="auth__input" type="number" min="0.01" max="87600" step="any" value={hours} onChange={(e) => setHours(e.target.value)} disabled={busy} /></label>}
      {duration === 'permanent' && <p className="dialog__message">This link stays public until you revoke it.</p>}
      <button className="btn btn--primary" disabled={busy} onClick={() => void create()}>{busy ? 'Please wait…' : 'Create public link'}</button>
      {url && <CopyField key={url} value={url} label="Public URL — copy before closing" />}
      {error && <p className="dialog__error" role="alert">{error}</p>}
      {shares.length > 0 && <section><h3>Your active links</h3><p className="dialog__message">Revoking blocks new download links. Already-issued download links may work for 60 seconds; files already downloaded or transfers in progress cannot be recalled.</p><ul className="share-dialog__list">{shares.map((share) => <li key={share.id}><span>Created {new Date(share.createdAt).toLocaleString()}<small>{share.expiresAt ? `Expires ${new Date(share.expiresAt).toLocaleString()}` : 'Permanent'}</small></span><button className="btn btn--ghost danger" disabled={busy} onClick={() => void revoke(share.id)}>Revoke</button></li>)}</ul></section>}
    </div>
  </Modal>
}
