import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

async function main() {
  // ✅ Wait for Noto Sans Khmer to fully load before rendering
  // iOS WebKit (used by ALL browsers on iPhone) won't shape Khmer
  // correctly if the font isn't ready when the user first types
  if (document.fonts?.load) {
    try {
      await Promise.all([
        document.fonts.load("400 16px 'Noto Sans Khmer'"),
        document.fonts.load("600 16px 'Noto Sans Khmer'"),
        document.fonts.load("700 16px 'Noto Sans Khmer'"),
      ])
      console.log('✅ Noto Sans Khmer loaded')
    } catch (e) {
      console.warn('⚠️ Font preload failed, rendering anyway:', e)
    }
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

main()