import PublicSharePage from './components/PublicSharePage'
import { DEFAULT_PREFERENCES } from './lib/preferences'
import { FONT_STYLESHEET } from './lib/preferences'
import { applyPreferences, readPreferences } from './lib/appearance'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const publicShare = ['/share', '/shared-preview'].includes(window.location.pathname)
applyPreferences(publicShare ? { ...DEFAULT_PREFERENCES, theme: 'light' } : readPreferences())
const fontStylesheet = document.createElement('link')
fontStylesheet.rel = 'stylesheet'
fontStylesheet.href = FONT_STYLESHEET
if (!publicShare) document.head.appendChild(fontStylesheet)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {publicShare ? <PublicSharePage /> : <App />}
  </StrictMode>,
)
