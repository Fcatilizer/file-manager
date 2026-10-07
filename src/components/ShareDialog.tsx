import { useEffect, useState } from 'react'
import CopyButton from './CopyButton'
import Modal, { ModalHeader } from './Modal'
import CopyField from './CopyField'
import { ChoiceChips } from './settings/SettingsControls'
import { createShare, listShares, revokeShare, type PublicShare } from '../lib/api'
import { Icon } from './Icon'
import '../styles/share-dialog.css'

type Props = {
  bucket: string
  item: { key: string; name: string; isFolder: boolean }
  isPrivate: boolean
  onClose: () => void
}

function formatShareDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatTimeRemaining(iso?: string | null): string {
  if (!iso) return 'Permanent'
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.round(diff / (1000 * 60 * 60))
  if (hours < 1) return '< 1h left'
  if (hours < 24) return `${hours}h left`
  const days = Math.round(hours / 24)
  return `${days}d left`
}

export default function ShareDialog({ bucket, item, isPrivate, onClose }: Props) {
  const [duration, setDuration] = useState('24h')
  const [hours, setHours] = useState('48')
  const [shares, setShares] = useState<PublicShare[]>([])
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    listShares(bucket, item.key)
      .then((data) => {
        if (live) setShares(data)
      })
      .catch((e) => {
        if (live) setError(e.message)
      })
    return () => {
      live = false
    }
  }, [bucket, item.key])

  const create = async () => {
    setBusy(true)
    setError('')
    try {
      const share = await createShare(bucket, item.key, item.isFolder, duration, Number(hours))
      setShares((current) => [share, ...current])
      setUrl(new URL(share.path, window.location.origin).href)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create link')
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (id: string) => {
    setBusy(true)
    setError('')
    try {
      await revokeShare(id)
      setShares((current) => current.filter((s) => s.id !== id))
      setUrl('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not revoke link')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      ariaLabel="Share publicly"
      className="dialog share-dialog-modal"
      onClose={onClose}
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
    >
      <div className="share-dialog">
        <ModalHeader onClose={onClose} disabled={busy} label="Close sharing">
          <div className="share-dialog__title-wrap">
            <div className="share-dialog__title-icon" aria-hidden="true">
              <Icon name="link" size={16} />
            </div>
            <h2>Share publicly</h2>
          </div>
        </ModalHeader>

        {/* Item context banner */}
        <div className="share-dialog__target">
          <div className="share-dialog__target-icon" aria-hidden="true">
            <Icon name={item.isFolder ? 'folder' : 'file'} size={18} color="var(--accent)" />
          </div>
          <div className="share-dialog__target-body">
            <span className="share-dialog__target-name" title={item.name}>
              {item.name}
            </span>
            <span className="share-dialog__target-desc">
              {item.isFolder
                ? 'Anyone with the link can view and download folder contents.'
                : 'Anyone with the link can view and download this file.'}
              {isPrivate && ' Accessible even when the private bucket is locked.'}
            </span>
          </div>
        </div>

        {/* Expiration and Creation Action */}
        <div className="share-dialog__create-card">
          <ChoiceChips
            label="Link expires"
            value={duration}
            onChange={setDuration}
            disabled={busy}
            options={[
              { value: '1h', label: '1 hour' },
              { value: '6h', label: '6 hours' },
              { value: '24h', label: '24 hours' },
              { value: 'permanent', label: 'Permanent' },
              { value: 'custom', label: 'Custom' },
            ]}
          />

          {duration === 'custom' && (
            <div className="share-dialog__custom-field">
              <label className="auth__field">
                <span className="auth__label">Expires in hours</span>
                <input
                  className="auth__input"
                  type="number"
                  min="0.01"
                  max="87600"
                  step="any"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  disabled={busy}
                  placeholder="e.g. 48"
                />
              </label>
            </div>
          )}

          <div className="share-dialog__create-bar">
            <span className="share-dialog__create-hint">
              {duration === 'permanent'
                ? 'Stays active until manually revoked.'
                : 'Automatically expires after the duration.'}
            </span>
            <button
              type="button"
              className="btn btn--primary share-dialog__create-btn"
              disabled={busy}
              onClick={() => void create()}
            >
              {busy ? (
                <>
                  <span className="spinner spinner--xs" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <Icon name="link" size={14} />
                  <span>Create link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Link Card */}
        {url && (
          <div className="share-dialog__result-card">
            <div className="share-dialog__result-header">
              <span className="share-dialog__result-badge">
                <Icon name="check" size={13} color="#10b981" />
                <span>Link ready to share</span>
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="share-dialog__result-open"
                title="Open public preview in new tab"
              >
                <span>Open</span>
                <Icon name="externalLink" size={12} />
              </a>
            </div>
            <CopyField key={url} value={url} label="Public URL" />
          </div>
        )}

        {error && (
          <p className="dialog__error share-dialog__error" role="alert">
            {error}
          </p>
        )}

        {/* Active Links Section */}
        {shares.length > 0 && (
          <div className="share-dialog__active-section">
            <div className="share-dialog__active-header">
              <h3>
                Active links <span className="share-dialog__badge-count">{shares.length}</span>
              </h3>
            </div>
            <ul className="share-dialog__list">
              {shares.map((share) => {
                const shareUrl = share.path ? new URL(share.path, window.location.origin).href : null
                return (
                  <li key={share.id} className="share-dialog__item">
                    <div className="share-dialog__item-info">
                      <div className="share-dialog__item-row">
                        <span
                          className={`share-dialog__pill ${
                            share.expiresAt ? 'share-dialog__pill--expiring' : 'share-dialog__pill--perm'
                          }`}
                        >
                          {formatTimeRemaining(share.expiresAt)}
                        </span>
                        <span className="share-dialog__item-date">
                          Created {formatShareDate(share.createdAt)}
                        </span>
                      </div>
                      {share.expiresAt && (
                        <span className="share-dialog__item-sub">
                          Expires {formatShareDate(share.expiresAt)}
                        </span>
                      )}
                    </div>
                    <div className="share-dialog__item-actions">
                      {shareUrl ? (
                        <CopyButton
                          value={shareUrl}
                          label="Copy link"
                          disabled={busy}
                          onError={(message) => {
                            setUrl(shareUrl)
                            setError(message)
                          }}
                        />
                      ) : (
                        <span
                          className="share-dialog__legacy"
                          title="This older link was stored as a hash and cannot be recovered."
                        >
                          Legacy link
                        </span>
                      )}
                      <button
                        type="button"
                        className="btn btn--ghost btn--xs danger share-dialog__revoke-btn"
                        disabled={busy}
                        onClick={() => void revoke(share.id)}
                      >
                        Revoke
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="share-dialog__disclaimer">
              Revoking blocks new access. Files already downloading cannot be recalled.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
