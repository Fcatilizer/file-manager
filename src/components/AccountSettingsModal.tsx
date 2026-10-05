import { useEffect, useRef, useState, type FormEvent } from 'react'
import Modal from './Modal'
import { Icon } from './Icon'
import { changePassword, updateAccount, type SessionUser } from '../lib/api'
import { ACCENTS, FONTS, DEFAULT_PREFERENCES, type Preferences } from '../lib/preferences'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: 'users' },
  { id: 'password', label: 'Password', icon: 'key' },
  { id: 'preferences', label: 'Preferences', icon: 'sun' },
] as const

type Props = {
  user: SessionUser
  preferences: Preferences
  onPreferencesChange: (preferences: Preferences) => void
  onUserUpdated: (user: SessionUser) => void
  onClose: () => void
}

export default function AccountSettingsModal({ user, preferences, onPreferencesChange, onUserUpdated, onClose }: Props) {
  const [section, setSection] = useState<typeof SECTIONS[number]['id']>('profile')
  const [name, setName] = useState(user.name || '')
  const [draft, setDraft] = useState(preferences)
  const savedPreferences = useRef(preferences)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    contentRef.current?.querySelector<HTMLElement>('button')?.focus()
    return () => {
      onPreferencesChange(savedPreferences.current)
      previousFocus?.focus()
    }
  }, [onPreferencesChange])

  const preview = (next: Preferences) => { setDraft(next); onPreferencesChange(next); setMessage(''); setError('') }
  const close = () => { if (!busy) onClose() }
  const run = async (action: () => Promise<void>) => {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try { await action() } catch (err) { setError(err instanceof Error ? err.message : 'Could not save settings') }
    finally { setBusy(false) }
  }
  const saveProfile = (event: FormEvent) => {
    event.preventDefault()
    void run(async () => {
      const updated = await updateAccount({ name: name.trim() })
      onUserUpdated(updated); setName(updated.name || ''); setMessage('Profile saved')
    })
  }
  const savePassword = (event: FormEvent) => {
    event.preventDefault()
    setError(''); setMessage('')
    if (newPassword !== confirmation) { setError('New passwords do not match'); return }
    if (currentPassword === newPassword) { setError('Choose a password different from your current password'); return }
    void run(async () => {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword(''); setNewPassword(''); setConfirmation(''); setMessage('Password updated')
    })
  }
  const savePreferences = () => void run(async () => {
    const updated = await updateAccount({ preferences: draft })
    savedPreferences.current = updated.preferences || draft
    onPreferencesChange(savedPreferences.current)
    onUserUpdated(updated); setMessage('Preferences saved')
  })

  return (
    <Modal onClose={close} className="account-settings" closeOnBackdrop={!busy} closeOnEscape={!busy} ariaLabel="Account settings">
      <div ref={contentRef} onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled)'))
        const first = controls[0], last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }}>
        <header className="account-settings__header">
          <div><h2>Account settings</h2><p>{user.email}</p></div>
          <button type="button" className="btn btn--icon" disabled={busy} onClick={close} aria-label="Close account settings"><Icon name="close" size={18} /></button>
        </header>
        <nav className="account-settings__nav" aria-label="Settings sections">
          {SECTIONS.map((item) => <button type="button" key={item.id} aria-current={section === item.id ? 'page' : undefined} disabled={busy} onClick={() => { setSection(item.id); setError(''); setMessage('') }}><Icon name={item.icon} size={15} />{item.label}</button>)}
        </nav>
        <div className="account-settings__body" aria-busy={busy}>
          {section === 'profile' && <form onSubmit={saveProfile}>
            <h3>Your profile</h3><p className="account-settings__hint">Choose the name shown in your vault.</p>
            <label className="auth__field"><span className="auth__label">Display name</span><input className="auth__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" required maxLength={80} disabled={busy} /></label>
            <label className="auth__field"><span className="auth__label">Email</span><input className="auth__input" value={user.email} readOnly type="email" /></label>
            <div className="account-settings__actions"><button className="btn btn--primary" disabled={busy || !name.trim()}>{busy ? 'Saving…' : 'Save profile'}</button></div>
          </form>}
          {section === 'password' && <form onSubmit={savePassword}>
            <h3>Change password</h3><p className="account-settings__hint">Confirm your current password to secure your account.</p>
            <label className="auth__field"><span className="auth__label">Current password</span><input className="auth__input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required disabled={busy} /></label>
            <label className="auth__field"><span className="auth__label">New password</span><input className="auth__input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required minLength={8} disabled={busy} /></label>
            <label className="auth__field"><span className="auth__label">Confirm new password</span><input className="auth__input" type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" required minLength={8} disabled={busy} /></label>
            <div className="account-settings__actions"><button className="btn btn--primary" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></div>
          </form>}
          {section === 'preferences' && <div>
            <h3>Make Vault yours</h3><p className="account-settings__hint">Preview changes here. Save to use them across your devices.</p>
            <div className="auth__field"><label className="auth__label" htmlFor="account-theme">Theme</label><select id="account-theme" className="auth__input" value={draft.theme} disabled={busy} onChange={(e) => preview({ ...draft, theme: e.target.value as Preferences['theme'] })}><option value="light">Light</option><option value="dark">Dark</option></select></div>
            <div className="auth__field"><label className="auth__label" htmlFor="account-font">Interface font</label><select id="account-font" className="auth__input" value={draft.font} disabled={busy} onChange={(e) => preview({ ...draft, font: e.target.value as Preferences['font'] })}>{Object.entries(FONTS).map(([id, font]) => <option key={id} value={id}>{font.label}</option>)}</select></div>
            <fieldset className="account-settings__accents" disabled={busy}><legend className="auth__label">Accent color</legend>{Object.entries(ACCENTS).map(([id, accent]) => <label key={id} className="account-settings__swatch"><input type="radio" name="accent" value={id} checked={draft.accent === id} onChange={() => preview({ ...draft, accent: id as Preferences['accent'] })} /><span style={{ background: accent[draft.theme] }} />{accent.label}</label>)}</fieldset>
            <label className="account-settings__rain"><span><strong>Rain animation</strong><small>Subtle diagonal rain. Paused when reduced motion is enabled.</small></span><input type="checkbox" role="switch" aria-label="Rain animation" checked={draft.rain} disabled={busy} onChange={(e) => preview({ ...draft, rain: e.target.checked })} /></label>
            <div className="account-settings__actions"><button type="button" className="btn btn--ghost" disabled={busy} onClick={() => preview({ ...DEFAULT_PREFERENCES })}>Reset defaults</button><button type="button" className="btn btn--ghost" disabled={busy} onClick={() => preview(savedPreferences.current)}>Cancel changes</button><button type="button" className="btn btn--primary" disabled={busy} onClick={savePreferences}>{busy ? 'Saving…' : 'Save preferences'}</button></div>
          </div>}
          {error && <p className="dialog__error" role="alert">{error}</p>}
          {message && <p className="account-settings__success" role="status">{message}</p>}
        </div>
      </div>
    </Modal>
  )
}
