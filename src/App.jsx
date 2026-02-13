/* App.jsx - Main application component that sets up context providers and renders the dashboard */
import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ContributionsProvider } from './contexts/ContributionsContext'
import { useToast } from './hooks/useToast'
import { Header } from './components/Header'
import { ToastContainer } from './components/Toast'
import { Statistics } from './components/Statistics'
import { PaymentBreakdownChart, CurrencyDistributionChart } from './components/Charts'
import { ContributionForm } from './components/ContributionForm'
import { ContributionsTable } from './components/ContributionsTable'

function Dashboard() {
  const { toasts, showToast, removeToast } = useToast()
  const [editingContribution, setEditingContribution] = useState(null)

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
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ContributionsProvider>
          <Dashboard />
        </ContributionsProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
