/*  <components />Charts.jsx - Displays contribution statistics using Chart.js
*/

import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { useLanguage } from '../contexts/LanguageContext'
import { useContributions } from '../contexts/ContributionsContext'

Chart.register(...registerables)

/* 1 USD = 4000 KHR — used only for ranking & visual scale, never shown as converted */
const KHR_TO_USD = 4000

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
  const cash  = contributions.filter(c => c.method === 'Cash').length

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
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
    },
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-[16px] font-bold text-gray-700 dark:text-gray-200 text-center mb-4 uppercase tracking-wider">
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
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16 } },
      },
    },
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-[16px] font-bold text-gray-700 dark:text-gray-200 text-center mb-4 uppercase tracking-wider">
        {t.currencyBreakdown}
      </h3>
      <div className="relative h-56">
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}

/* ─── Top 10 Contributors ─────────────────────────────────── */
export function TopContributorsChart() {
  const { t } = useLanguage()
  const { contributions } = useContributions()
  const chartRef = useRef(null)

  // Group by name — keep USD and KHR totals separate
  const map = {}
  contributions.forEach(c => {
    if (!map[c.name]) map[c.name] = { usd: 0, khr: 0 }
    if (c.currency === 'USD') map[c.name].usd += c.amount
    else                      map[c.name].khr += c.amount
  })

  // ✅ Rank by TRUE combined USD value: usd + (khr ÷ 4000)
  const top10 = Object.entries(map)
    .sort(([, a], [, b]) => {
      const totalA = a.usd + a.khr / KHR_TO_USD
      const totalB = b.usd + b.khr / KHR_TO_USD
      return totalB - totalA
    })
    .slice(0, 15)

  const labels  = top10.map(([name]) => name)
  const usdData = top10.map(([, v]) => v.usd)
  const khrData = top10.map(([, v]) => v.khr)

  useChart(chartRef, () => ({
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: `${t.dollar ?? 'Dollar'} (USD)`,
          data: usdData,
          backgroundColor: '#3B82F6',
          borderRadius: 6,
          borderSkipped: false,
          stack: 'stack',
        },
        {
          label: `${t.riel ?? 'Riel'} (KHR)`,
          // ✅ Plot KHR bars converted to USD so the bar heights are visually fair
          data: khrData.map(v => v / KHR_TO_USD),
          backgroundColor: '#10B981',
          borderRadius: 6,
          borderSkipped: false,
          stack: 'stack',
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, boxWidth: 12, borderRadius: 4 },
        },
        tooltip: {
          callbacks: {
            // ✅ Tooltip always shows ORIGINAL amounts, not converted values
            label: (ctx) => {
              const idx = ctx.dataIndex
              if (ctx.datasetIndex === 0) {
                const val = usdData[idx]
                if (val === 0) return null
                return ` $${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              } else {
                const val = khrData[idx]
                if (val === 0) return null
                return ` ${val.toLocaleString()} ៛`
              }
            },
            title: (items) => items[0]?.label ?? '',
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            // ✅ X-axis labels show USD equivalent scale
            callback: (val) => {
              if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`
              return `$${val}`
            },
          },
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 12, weight: '600' } },
        },
      },
    },
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-[16px] font-bold text-gray-700 dark:text-gray-200 text-center mb-1 uppercase tracking-wider">
        {t.topContributors ?? 'Top 15 Contributors'}
      </h3>
      <div className="relative" style={{ height: `${Math.max(top10.length * 44 + 70, 180)}px` }}>
        {top10.length === 0
          ? <p className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              {t.noContributions}
            </p>
          : <canvas ref={chartRef} />
        }
      </div>
    </div>
  )
}

/* ─── Currency Amount Breakdown ───────────────────────────── */
export function CurrencyAmountChart() {
  const { t } = useLanguage()
  const { contributions } = useContributions()
  const chartRef = useRef(null)

  const totalUSD = contributions
    .filter(c => c.currency === 'USD')
    .reduce((sum, c) => sum + c.amount, 0)

  const totalKHR = contributions
    .filter(c => c.currency === 'KHR')
    .reduce((sum, c) => sum + c.amount, 0)

  // ✅ Convert KHR → USD for fair visual bar height comparison
  const totalKHRinUSD = totalKHR / KHR_TO_USD

  useChart(chartRef, () => ({
    type: 'bar',
    data: {
      labels: [
        `${t.dollar ?? 'Dollar'} (USD)`,
        `${t.riel ?? 'Riel'} (KHR)`,
      ],
      datasets: [{
        label: 'USD Equivalent',
        // ✅ Both bars plotted on same USD scale so heights are visually correct
        data: [totalUSD, totalKHRinUSD],
        backgroundColor: ['rgba(59,130,246,0.85)', 'rgba(16,185,129,0.85)'],
        borderColor: ['#3B82F6', '#10B981'],
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (ctx.dataIndex === 0) {
                // ✅ Show original USD amount
                return ` $${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              } else {
                // ✅ Show original KHR + USD equivalent in tooltip
                return [
                  ` ${totalKHR.toLocaleString()} ៛`,
                  ` ≈ $${totalKHRinUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
                ]
              }
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            // ✅ Y-axis in USD scale
            callback: (val) => {
              if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
              if (val >= 1_000)     return `$${(val / 1_000).toFixed(0)}k`
              return `$${val}`
            },
          },
        },
      },
    },
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-[16px] font-bold text-gray-700 dark:text-gray-200 text-center mb-1 uppercase tracking-wider">
        {t.currencyAmountBreakdown ?? 'Currency Amount Breakdown'}
      </h3>
      {/* Stat pills — always show ORIGINAL values */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {totalKHR.toLocaleString()} ៛
          </span>
        </div>
      </div>

      <div className="relative h-52">
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}