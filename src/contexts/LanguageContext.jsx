/* <contexts />LanguageContext.jsx - Manages application language state and persistence*/
import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../utils/translations'

const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en')

  useEffect(() => {
    document.documentElement.setAttribute('data-language', language)
    localStorage.setItem('language', language)
  }, [language])

  const toggleLanguage = () => setLanguage(prev => (prev === 'en' ? 'km' : 'en'))
  const t = translations[language]

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
