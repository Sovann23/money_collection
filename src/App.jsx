/* App.jsx - Main application component that sets up context providers and renders the dashboard */
import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ContributionsProvider } from './contexts/ContributionsContext'
import { useToast } from './hooks/useToast'
import { Header } from './components/Header'
import { Auth } from './components/Auth'
import { ToastContainer } from './components/Toast'
import { Statistics } from './components/Statistics'
import { PaymentBreakdownChart, CurrencyDistributionChart, CurrencyAmountChart, TopContributorsChart } from './components/Charts'
import { ContributionForm } from './components/ContributionForm'
import { ContributionsTable } from './components/ContributionsTable'

function Dashboard() {
  const { toasts, showToast, removeToast } = useToast()
  const [editingContribution, setEditingContribution] = useState(null)

  console.log('Dashboard rendering')

  try {
    return (
      <>
        <Header />
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Stats row */}
          <Statistics />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentBreakdownChart />
            <CurrencyDistributionChart />
            <TopContributorsChart />
            <CurrencyAmountChart/>
          </div>

          {/* Form + Table row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContributionForm
              showToast={showToast}
              editingContribution={editingContribution}
              setEditingContribution={setEditingContribution}
            />
            <ContributionsTable
              showToast={showToast}
              setEditingContribution={setEditingContribution}
            />
          </div>
        </main>
      </>
    )
  } catch (error) {
    console.error('Error in Dashboard:', error)
    return <div className="p-4 text-red-500">Error loading dashboard: {error.message}</div>
  }
}

function AppContent() {
  const { user, loading, configError } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-xl w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Configuration Required</h2>
          <p className="mt-3 text-sm text-gray-600">
            {configError}
          </p>
          <div className="mt-5 text-left text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-4">
            <p className="font-semibold text-gray-700 mb-2">Example `.env`:</p>
            <pre className="whitespace-pre-wrap">
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
            </pre>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <ContributionsProvider>
      <Dashboard />
    </ContributionsProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
