import { DEFAULT_PREFERENCES, type Preferences } from './lib/preferences'
import { applyPreferences, readPreferences } from './lib/appearance'
import { useState, useEffect, useCallback } from 'react'
import {
  getSession,
  updateAccount,
  getAuthStatus,
  logout,
  UNAUTHORIZED_EVENT,
  type SessionUser,
} from './lib/api'
import RainBackground from './components/RainBackground'
import Login from './components/Login'
import Setup from './components/Setup'
import FileManager from './components/FileManager'

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [setupTokenRequired, setSetupTokenRequired] = useState(false)

  const [preferences, setPreferences] = useState<Preferences>(readPreferences)
  const [appearanceError, setAppearanceError] = useState('')
  const [savingTheme, setSavingTheme] = useState(false)
  const theme = preferences.theme

  useEffect(() => {
    applyPreferences(preferences)
    try { localStorage.setItem('vault:preferences', JSON.stringify(preferences)) } catch { /* optional browser cache */ }
  }, [preferences])

  const acceptUser = useCallback((nextUser: SessionUser) => {
    setUser(nextUser)
    setPreferences(nextUser.preferences || { ...DEFAULT_PREFERENCES })
  }, [])

  const toggleTheme = async () => {
    if (savingTheme) return
    const next: Preferences = { ...preferences, theme: theme === 'dark' ? 'light' : 'dark' }
    setPreferences(next)
    setAppearanceError('')
    if (!user) return
    setSavingTheme(true)
    try {
      const updated = await updateAccount({ preferences: next })
      setUser((current) => current ? { ...current, preferences: updated.preferences } : null)
    } catch (err) {
      setPreferences(preferences)
      setAppearanceError(err instanceof Error ? err.message : 'Could not save theme')
    } finally { setSavingTheme(false) }
  }

  // ─── Session + setup bootstrap ──────────────────────────
  useEffect(() => {
    let active = true
    ;(async () => {
      const [status, session] = await Promise.all([getAuthStatus(), getSession()])
      if (!active) return
      setNeedsSetup(status.needsSetup)
      setSetupTokenRequired(status.setupTokenRequired)
      if (session) acceptUser(session)
      setAuthChecking(false)
    })()
    return () => {
      active = false
    }
  }, [acceptUser])

  // ─── Global 401 handling (session expired / user removed) ─
  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } finally {
      setUser(null)
    }
  }, [])

  const handleSetupComplete = useCallback((created: SessionUser) => {
    setNeedsSetup(false)
    acceptUser(created)
  }, [acceptUser])

  // ─── Render ─────────────────────────────────────────────
  let content
  if (authChecking) {
    content = (
      <div className="auth-splash">
        <div className="auth-splash__inner">
          <div className="spinner" />
          <span className="auth-splash__brand"><span>◆</span> Vault</span>
        </div>
      </div>
    )
  } else if (needsSetup) {
    content = (
      <Setup
        theme={theme}
        onToggleTheme={toggleTheme}
        setupTokenRequired={setupTokenRequired}
        onSuccess={handleSetupComplete}
      />
    )
  } else if (!user) {
    content = <Login theme={theme} onToggleTheme={toggleTheme} onSuccess={acceptUser} />
  } else {
    content = (
      <FileManager
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        preferences={preferences}
        onPreferencesChange={setPreferences}
        onUserUpdated={setUser}
      />
    )
  }

  return <><RainBackground enabled={preferences.rain} />{content}{appearanceError && <div className="toast toast--error" role="alert" onClick={() => setAppearanceError('')}>{appearanceError}</div>}</>
}
