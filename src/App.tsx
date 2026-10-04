import { useState, useEffect, useCallback } from 'react'
import {
  getSession,
  getAuthStatus,
  logout,
  UNAUTHORIZED_EVENT,
  type SessionUser,
} from './lib/api'
import Login from './components/Login'
import Setup from './components/Setup'
import FileManager from './components/FileManager'

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [setupTokenRequired, setSetupTokenRequired] = useState(false)

  // ─── Theme ──────────────────────────────────────────────
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignore storage errors
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // ─── Session + setup bootstrap ──────────────────────────
  useEffect(() => {
    let active = true
    ;(async () => {
      const [status, session] = await Promise.all([getAuthStatus(), getSession()])
      if (!active) return
      setNeedsSetup(status.needsSetup)
      setSetupTokenRequired(status.setupTokenRequired)
      setUser(session)
      setAuthChecking(false)
    })()
    return () => {
      active = false
    }
  }, [])

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
    setUser(created)
  }, [])

  // ─── Render ─────────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="auth-splash">
        <div className="auth-splash__inner">
          <div className="spinner" />
          <span className="auth-splash__brand"><span>◆</span> Vault</span>
        </div>
      </div>
    )
  }

  if (needsSetup) {
    return (
      <Setup
        theme={theme}
        onToggleTheme={toggleTheme}
        setupTokenRequired={setupTokenRequired}
        onSuccess={handleSetupComplete}
      />
    )
  }

  if (!user) {
    return <Login theme={theme} onToggleTheme={toggleTheme} onSuccess={setUser} />
  }

  return (
    <FileManager
      user={user}
      theme={theme}
      onToggleTheme={toggleTheme}
      onLogout={handleLogout}
    />
  )
}
