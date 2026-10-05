import AppearanceControls from './AppearanceControls'
import { useState, type FormEvent } from 'react'
import { Icon } from './Icon'
import { setupAdmin, type SessionUser } from '../lib/api'

type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  setupTokenRequired: boolean
  onSuccess: (user: SessionUser) => void
}

export default function Setup({ theme, onToggleTheme, setupTokenRequired, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const user = await setupAdmin(email.trim(), password, token.trim() || undefined)
      onSuccess(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__theme">
        <AppearanceControls theme={theme} onToggleTheme={onToggleTheme} />
      </div>

      <form className="auth__card" onSubmit={handleSubmit}>
        <div className="auth__brand">
          <span className="auth__logo">◆</span> Vault
        </div>
        <p className="auth__tagline">Create the first admin account to get started</p>

        <label className="auth__field">
          <span className="auth__label">Admin email</span>
          <input
            className="auth__input"
            type="email"
            value={email}
            autoComplete="username"
            autoFocus
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="auth__field">
          <span className="auth__label">Password</span>
          <input
            className="auth__input"
            type="password"
            value={password}
            autoComplete="new-password"
            required
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </label>

        <label className="auth__field">
          <span className="auth__label">Confirm password</span>
          <input
            className="auth__input"
            type="password"
            value={confirm}
            autoComplete="new-password"
            required
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
          />
        </label>

        {setupTokenRequired && (
          <label className="auth__field">
            <span className="auth__label">Setup token</span>
            <input
              className="auth__input"
              type="password"
              value={token}
              required
              onChange={(e) => setToken(e.target.value)}
              placeholder="SETUP_TOKEN from your .env"
            />
          </label>
        )}

        {error && (
          <div className="auth__error" role="alert">
            <Icon name="close" size={13} /> {error}
          </div>
        )}

        <button className="btn btn--primary auth__submit" type="submit" disabled={submitting}>
          {submitting ? <span className="spinner spinner--sm" /> : <Icon name="check" size={14} />}
          {submitting ? 'Creating…' : 'Create admin & continue'}
        </button>
      </form>
    </div>
  )
}
