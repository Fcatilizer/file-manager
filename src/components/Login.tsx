import { useState, type FormEvent } from 'react'
import { Icon } from './Icon'
import { login, type SessionUser } from '../lib/api'

type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onSuccess: (user: SessionUser) => void
}

export default function Login({ theme, onToggleTheme, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(email.trim(), password)
      onSuccess(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <button
        className="theme-toggle auth__theme"
        onClick={onToggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
      </button>

      <form className="auth__card" onSubmit={handleSubmit}>
        <div className="auth__brand">
          <span className="auth__logo">◆</span> Vault
        </div>
        <p className="auth__tagline">Sign in to access your files</p>

        <label className="auth__field">
          <span className="auth__label">Email</span>
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
            autoComplete="current-password"
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {error && (
          <div className="auth__error" role="alert">
            <Icon name="close" size={13} /> {error}
          </div>
        )}

        <button className="btn btn--primary auth__submit" type="submit" disabled={submitting}>
          {submitting ? <span className="spinner spinner--sm" /> : <Icon name="eye" size={14} />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
