/*  <contexts />ContributionsContext.jsx - Manages contributions state and persistence*/
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, hasSupabaseConfig } from './AuthContext'
import { useAuth } from './AuthContext'

const ContributionsContext = createContext()

export const useContributions = () => useContext(ContributionsContext)

export function ContributionsProvider({ children }) {
  const { user } = useAuth()
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)

  console.log('ContributionsProvider render:', { user: !!user, contributionsLength: contributions.length, loading })

  const mapRow = (row) => ({
    id: row.id ?? row.ID,
    participantName: row.name ?? row.participantName ?? '',
    paymentMethod: row.method ?? row.paymentMethod ?? '',
    currency: row.currency ?? '',
    amount: row.amount ?? 0,
    remark: row.remark ?? '',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  })

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setContributions([])
      setLoading(false)
      return
    }

    if (user) {
      fetchContributions()
      // Migrate localStorage data if exists and no contributions in DB
      migrateLocalData()
    } else {
      setContributions([])
      setLoading(false)
    }
  }, [user])

  const migrateLocalData = async () => {
    try {
      const stored = localStorage.getItem('contributions')
      if (stored) {
        const localContributions = JSON.parse(stored)
        if (localContributions.length > 0 && contributions.length === 0) {
          // Map local data to expected format
          const mappedContributions = localContributions.map(c => ({
            participantName: c.participantName,
            paymentMethod: c.paymentMethod,
            currency: c.currency,
            amount: c.amount,
            remark: c.remark,
            createdAt: c.createdAt
          }))
          // Import local data to Supabase
          await importContributions(mappedContributions)
          // Clear localStorage after successful migration
          localStorage.removeItem('contributions')
        }
      }
    } catch (error) {
      console.error('Error migrating local data:', error)
    }
  }

  const fetchContributions = async () => {
    if (!hasSupabaseConfig) return
    setLoading(true)
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    console.log('fetchContributions result:', { data, error })

    if (error) {
      console.error('Error fetching contributions:', error)
    } else {
      // Map database fields to app fields
      const mappedData = (data || []).map(mapRow)
      console.log('Mapped contributions:', mappedData)
      setContributions(mappedData)
    }
    setLoading(false)
  }

  const addContribution = async (contribution) => {
    if (!hasSupabaseConfig) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('contributions')
      .insert([{
        name: contribution.participantName,
        method: contribution.paymentMethod,
        currency: contribution.currency,
        amount: contribution.amount,
        remark: contribution.remark,
        user_id: user.id,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Error adding contribution:', error)
      throw error
    } else {
      setContributions(prev => [mapRow(data?.[0] ?? {}), ...prev])
    }
  }

  const updateContribution = async (id, data) => {
    if (!hasSupabaseConfig) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('contributions')
      .update({
        name: data.participantName,
        method: data.paymentMethod,
        currency: data.currency,
        amount: data.amount,
        remark: data.remark
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating contribution:', error)
      throw error
    } else {
      setContributions(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
    }
  }

  const deleteContribution = async (id) => {
    if (!hasSupabaseConfig) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('contributions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting contribution:', error)
      throw error
    } else {
      setContributions(prev => prev.filter(c => c.id !== id))
    }
  }

  const importContributions = async (newContributions) => {
    if (!hasSupabaseConfig) throw new Error('Supabase not configured')
    const contributionsWithUser = newContributions.map(c => ({
      name: c.participantName,
      method: c.paymentMethod,
      currency: c.currency,
      amount: c.amount,
      remark: c.remark,
      user_id: user.id,
      created_at: c.createdAt || new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('contributions')
      .insert(contributionsWithUser)
      .select()

    if (error) {
      console.error('Error importing contributions:', error)
      throw error
    } else {
      setContributions(prev => [...(data || []).map(mapRow), ...prev])
    }
  }

  const clearContributions = async () => {
    if (!hasSupabaseConfig) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('contributions')
      .delete()
      .eq('user_id', user.id) // Delete only current user's rows

    if (error) {
      console.error('Error clearing contributions:', error)
      throw error
    } else {
      setContributions([])
    }
  }

  return (
    <ContributionsContext.Provider
      value={{
        contributions,
        loading,
        addContribution,
        updateContribution,
        deleteContribution,
        importContributions,
        clearContributions
      }}
    >
      {children}
    </ContributionsContext.Provider>
  )
}
