
/*  <components />Charts.jsx - Displays contribution statistics using Chart.js
*/

import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { useLanguage } from '../contexts/LanguageContext'
import { useContributions } from '../contexts/ContributionsContext'

Chart.register(...registerables)

function useChart(ref, getConfig) {
  const instance = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    if (instance.current) instance.current.destroy()
    instance.current = new Chart(ref.current.getContext('2d'), getConfig())
    return () => instance.current?.destroy()
  })
}

export function PaymentBreakdownChart() {
  const { t } = useLanguage()
  const { contributions } = useContributions()
  const chartRef = useRef(null)

  const khqr = contributions.filter(c => c.method === 'KHQR').length
  const cash = contributions.filter(c => c.method === 'Cash').length

  useChart(chartRef, () => ({
    type: 'bar',
    data: {
      labels: [t.khqr, t.cash],
      datasets: [{
        label: t.participants,
        data: [khqr, cash],
        backgroundColor: ['#3B82F6', '#10B981'],
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
      },
    },
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 text-center mb-4 uppercase tracking-wider">
        {t.paymentBreakdown}
      </h3>
      <div className="relative h-56">
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}

export function CurrencyDistributionChart() {
  const { t } = useLanguage()
  const { contributions } = useContributions()
  const chartRef = useRef(null)

  const usd = contributions.filter(c => c.currency === 'USD').length
  const khr = contributions.filter(c => c.currency === 'KHR').length

  useChart(chartRef, () => ({
    type: 'doughnut',
    data: {
      labels: [t.dollar, t.riel],
      datasets: [{
        data: [usd, khr],
        backgroundColor: ['#3B82F6', '#10B981'],
        hoverOffset: 6,
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { padding: 16 } } },
    },
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 text-center mb-4 uppercase tracking-wider">
        {t.currencyBreakdown}
      </h3>
      <div className="relative h-56">
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}
