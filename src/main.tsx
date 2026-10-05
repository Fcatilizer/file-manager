import { FONT_STYLESHEET } from './lib/preferences'
import { applyPreferences, readPreferences } from './lib/appearance'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

applyPreferences(readPreferences())
const fontStylesheet = document.createElement('link')
fontStylesheet.rel = 'stylesheet'
fontStylesheet.href = FONT_STYLESHEET
document.head.appendChild(fontStylesheet)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
