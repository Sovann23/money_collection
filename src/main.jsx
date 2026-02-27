// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ Wait for Noto Sans Khmer to load before rendering
// This prevents dotted circles on iOS Safari during typing
async function main() {
  try {
    await document.fonts.load("400 16px 'Noto Sans Khmer'")
    await document.fonts.load("700 16px 'Noto Sans Khmer'")
  } catch (e) {
    // Font failed to load (offline etc.) — render anyway
    console.warn('Font preload failed, rendering anyway:', e)
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

main()