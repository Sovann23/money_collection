/*  <components />Statistics.jsx - Displays key statistics about contributions*/

import { useLanguage } from '../contexts/LanguageContext'
import { useContributions } from '../contexts/ContributionsContext'

const UsersIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

function StatCard({ icon, colorClass, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-7 border border-gray-100 dark:border-gray-700 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4 ${colorClass}`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight leading-none">
        {value}
      </p>
    </div>
  )
}

export function Statistics() {
  const { t } = useLanguage()
  const { contributions } = useContributions()

  const totalUSD = contributions
    .filter(c => c.currency === 'USD')
    .reduce((sum, c) => sum + c.amount, 0)

  const totalKHR = contributions
    .filter(c => c.currency === 'KHR')
    .reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
      <StatCard
        icon="$"
        colorClass="bg-blue-500"
        label={`${t.totalCollected} (USD)`}
        value={`$${totalUSD.toLocaleString()}`}
      />
      <StatCard
        icon="៛"
        colorClass="bg-emerald-500"
        label={`${t.totalCollected} (KHR)`}
        value={`${totalKHR.toLocaleString()} ៛`}
      />
      <StatCard
        icon={<UsersIcon />}
        colorClass="bg-purple-400"
        label={t.participants}
        value={contributions.length}
      />
    </div>
  )
}
