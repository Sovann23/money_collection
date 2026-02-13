/*  <contexts />ContributionsContext.jsx - Manages contributions state and persistence*/
import { createContext, useContext, useState, useEffect } from 'react'

const ContributionsContext = createContext()

export const useContributions = () => useContext(ContributionsContext)

export function ContributionsProvider({ children }) {
  const [contributions, setContributions] = useState(() => {
    try {
      const stored = localStorage.getItem('contributions')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('contributions', JSON.stringify(contributions))
  }, [contributions])

  const addContribution = (c) =>
    setContributions(prev => [
      ...prev,
      { ...c, id: Date.now(), createdAt: new Date().toISOString() },
    ])

  const updateContribution = (id, data) =>
    setContributions(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)))

  const deleteContribution = (id) =>
    setContributions(prev => prev.filter(c => c.id !== id))

  const importContributions = (newOnes) =>
    setContributions(prev => [...prev, ...newOnes])

  const clearContributions = () => setContributions([])

  return (
    <ContributionsContext.Provider
      value={{ contributions, addContribution, updateContribution, deleteContribution, importContributions, clearContributions}}
    >
      {children}
    </ContributionsContext.Provider>
  )
}
