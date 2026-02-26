/*  <components />ContributionsTable.jsx
    - Scrollable table (capped height)
    - CSV import / export / Clear All
    - "Download PDF" → direct PDF generator (same on desktop + mobile)
      · Payment Method bar chart (pure SVG)
      · Currency Distribution doughnut chart (pure SVG)
      · Top 15 Contributors horizontal bar chart (pure SVG)
      · Currency Amount Breakdown vertical bar chart (pure SVG)
      · Contribution records table
*/

import { useState, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useContributions } from '../contexts/ContributionsContext'

/* ─── Icons ──────────────────────────────────────────────── */
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const ExportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const ImportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)
const ClearAllIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

/* ─── Helpers ─────────────────────────────────────────────── */
function formatAmount(amount, currency) {
  return currency === 'KHR'
    ? `${amount.toLocaleString()} ៛`
    : `$${amount.toFixed(2)}`
}

const KHR_TO_USD = 4000

/* ─── SVG Chart Builders ──────────────────────────────────── */

/** Bar chart: KHQR vs Cash counts */
function buildBarChartSvg(khqrCount, cashCount, khqrLabel, cashLabel) {
  const W = 340, H = 160
  const maxVal = Math.max(khqrCount, cashCount, 1)
  const barW = 60, gap = 50
  const chartH = 110
  const baseY = H - 30

  const khqrH = Math.max((khqrCount / maxVal) * chartH, khqrCount > 0 ? 4 : 0)
  const cashH  = Math.max((cashCount  / maxVal) * chartH, cashCount  > 0 ? 4 : 0)

  const x1 = (W / 2) - barW - gap / 2
  const x2 = (W / 2) + gap / 2

  const gridLines = [0, 0.5, 1].map(f => {
    const y = baseY - f * chartH
    return `<line x1="20" y1="${y}" x2="${W - 20}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${gridLines}
    <rect x="${x1}" y="${baseY - khqrH}" width="${barW}" height="${khqrH}" fill="#3B82F6" rx="6"/>
    <text x="${x1 + barW/2}" y="${baseY - khqrH - 6}" text-anchor="middle" font-size="12" font-weight="700" fill="#3B82F6">${khqrCount}</text>
    <text x="${x1 + barW/2}" y="${baseY + 16}" text-anchor="middle" font-size="11" fill="#64748b">${khqrLabel}</text>
    <rect x="${x2}" y="${baseY - cashH}" width="${barW}" height="${cashH}" fill="#10B981" rx="6"/>
    <text x="${x2 + barW/2}" y="${baseY - cashH - 6}" text-anchor="middle" font-size="12" font-weight="700" fill="#10B981">${cashCount}</text>
    <text x="${x2 + barW/2}" y="${baseY + 16}" text-anchor="middle" font-size="11" fill="#64748b">${cashLabel}</text>
    <line x1="20" y1="${baseY}" x2="${W - 20}" y2="${baseY}" stroke="#cbd5e1" stroke-width="1.5"/>
  </svg>`
}

/** Doughnut chart: USD vs KHR counts */
function buildDoughnutSvg(usdCount, khrCount, usdLabel, khrLabel) {
  const SIZE = 160, cx = SIZE / 2, cy = SIZE / 2
  const R = 58, innerR = 34
  const total = usdCount + khrCount

  let svgContent = ''

  if (total === 0) {
    svgContent = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#e2e8f0" stroke-width="${R - innerR}"/>`
  } else {
    const usdAngle = (usdCount / total) * 360
    function polarToCartesian(angleDeg, radius) {
      const rad = ((angleDeg - 90) * Math.PI) / 180
      return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
    }
    function arcPath(startAngle, endAngle, color) {
      const sweep = endAngle - startAngle
      if (sweep >= 360) {
        return `<circle cx="${cx}" cy="${cy}" r="${(R + innerR) / 2}" fill="none" stroke="${color}" stroke-width="${R - innerR}"/>`
      }
      const s = polarToCartesian(startAngle, R)
      const e = polarToCartesian(endAngle, R)
      const si = polarToCartesian(startAngle, innerR)
      const ei = polarToCartesian(endAngle, innerR)
      const large = sweep > 180 ? 1 : 0
      return `<path d="M${s.x},${s.y} A${R},${R} 0 ${large},1 ${e.x},${e.y} L${ei.x},${ei.y} A${innerR},${innerR} 0 ${large},0 ${si.x},${si.y} Z" fill="${color}"/>`
    }
    svgContent = arcPath(0, usdAngle, '#3B82F6') + arcPath(usdAngle, 360, '#10B981')
  }

  const centerLabel = total > 0 ? `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="16" font-weight="800" fill="#0f172a">${total}</text>` : ''
  const legendY = SIZE + 14
  const legend = `
    <rect x="${cx - 80}" y="${legendY}" width="10" height="10" rx="2" fill="#3B82F6"/>
    <text x="${cx - 66}" y="${legendY + 9}" font-size="10" fill="#64748b">${usdLabel} (${usdCount})</text>
    <rect x="${cx + 4}" y="${legendY}" width="10" height="10" rx="2" fill="#10B981"/>
    <text x="${cx + 18}" y="${legendY + 9}" font-size="10" fill="#64748b">${khrLabel} (${khrCount})</text>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE + 30}" viewBox="0 0 ${SIZE} ${SIZE + 30}">
    ${svgContent}
    ${centerLabel}
    ${legend}
  </svg>`
}

/** Horizontal bar chart: Top 15 Contributors — fixed height matching Currency Amount chart */
function buildTopContributorsSvg(contributions, dollarLabel, rielLabel) {
  const KHR = 4000
  const map = {}
  contributions.forEach(c => {
    if (!map[c.participantName]) map[c.participantName] = { usd: 0, khr: 0 }
    if (c.currency === 'USD') map[c.participantName].usd += c.amount
    else map[c.participantName].khr += c.amount
  })

  const top15 = Object.entries(map)
    .sort(([, a], [, b]) => (b.usd + b.khr / KHR) - (a.usd + a.khr / KHR))
    .slice(0, 15)

  const W = 320
  const H = 200
  const labelW = 90
  const PAD_TOP = 12
  const PAD_BOT = 28
  const chartW = W - labelW - 8
  const dataH = H - PAD_TOP - PAD_BOT

  if (top15.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <text x="${W/2}" y="${H/2}" text-anchor="middle" font-size="11" fill="#94a3b8">No data</text>
    </svg>`
  }

  const rowH = dataH / top15.length
  const barH = Math.min(rowH * 0.55, 14)
  const maxVal = Math.max(...top15.map(([, v]) => v.usd + v.khr / KHR), 1)

  const gridLines = [0, 0.5, 1].map(f => {
    const x = labelW + f * chartW
    const label = f === 0 ? '$0' : maxVal * f >= 1000 ? `$${((maxVal * f) / 1000).toFixed(0)}k` : `$${(maxVal * f).toFixed(0)}`
    return `
      <line x1="${x}" y1="${PAD_TOP}" x2="${x}" y2="${PAD_TOP + dataH}" stroke="#e2e8f0" stroke-width="1"/>
      <text x="${x}" y="${H - 8}" text-anchor="middle" font-size="8" fill="#94a3b8">${label}</text>`
  }).join('')

  const bars = top15.map(([name, v], i) => {
    const y = PAD_TOP + i * rowH
    const usdW = (v.usd / maxVal) * chartW
    const khrW = (v.khr / KHR / maxVal) * chartW
    const totalW = usdW + khrW
    const barY = y + (rowH - barH) / 2

    const displayName = name.length > 11 ? name.slice(0, 10) + '…' : name
    const usdTxt = v.usd > 0 ? `$${v.usd.toFixed(0)}` : ''
    const khrTxt = v.khr > 0 ? `+${(v.khr / 1000).toFixed(0)}k៛` : ''
    const valLabel = [usdTxt, khrTxt].filter(Boolean).join(' ')

    return `
      <text x="${labelW - 4}" y="${barY + barH / 2 + 3}" text-anchor="end" font-size="8.5" font-weight="600" fill="#334155">${displayName}</text>
      ${v.usd > 0 ? `<rect x="${labelW}" y="${barY}" width="${usdW}" height="${barH}" fill="#3B82F6" rx="3"/>` : ''}
      ${v.khr > 0 ? `<rect x="${labelW + usdW}" y="${barY}" width="${khrW}" height="${barH}" fill="#10B981" rx="3"/>` : ''}
      <text x="${labelW + totalW + 3}" y="${barY + barH / 2 + 3}" font-size="7.5" fill="#64748b">${valLabel}</text>`
  }).join('')

  const legY = H - 10
  const legX = labelW + chartW / 2 - 55
  const legend = `
    <rect x="${legX}" y="${legY - 7}" width="8" height="8" rx="1.5" fill="#3B82F6"/>
    <text x="${legX + 11}" y="${legY}" font-size="8" fill="#64748b">${dollarLabel} (USD)</text>
    <rect x="${legX + 72}" y="${legY - 7}" width="8" height="8" rx="1.5" fill="#10B981"/>
    <text x="${legX + 83}" y="${legY}" font-size="8" fill="#64748b">${rielLabel} (KHR)</text>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${gridLines}
    ${bars}
    ${legend}
  </svg>`
}

/** Vertical bar chart: Currency Amount Breakdown (USD vs KHR in USD scale) */
function buildCurrencyAmountSvg(contributions, dollarLabel, rielLabel) {
  const KHR = 4000
  const totalUSD = contributions.filter(c => c.currency === 'USD').reduce((s, c) => s + c.amount, 0)
  const totalKHR = contributions.filter(c => c.currency === 'KHR').reduce((s, c) => s + c.amount, 0)
  const totalKHRinUSD = totalKHR / KHR

  const W = 340, H = 200
  const barW = 70, gap = 60
  const chartH = 130
  const baseY = H - 40
  const maxVal = Math.max(totalUSD, totalKHRinUSD, 1)

  const usdH = Math.max((totalUSD / maxVal) * chartH, totalUSD > 0 ? 4 : 0)
  const khrH = Math.max((totalKHRinUSD / maxVal) * chartH, totalKHRinUSD > 0 ? 4 : 0)

  const x1 = (W / 2) - barW - gap / 2
  const x2 = (W / 2) + gap / 2

  function fmtAxis(val) {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`
    return `$${val.toFixed(0)}`
  }

  const gridLines = [0, 0.5, 1].map(f => {
    const y = baseY - f * chartH
    return `
      <line x1="20" y1="${y}" x2="${W - 20}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>
      <text x="18" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${fmtAxis(maxVal * f)}</text>`
  }).join('')

  const usdValTxt = `$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const khrValTxt = `${totalKHR.toLocaleString()}៛`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${gridLines}
    <rect x="${x1}" y="${baseY - usdH}" width="${barW}" height="${usdH}" fill="#3B82F6" rx="6"/>
    <text x="${x1 + barW/2}" y="${baseY - usdH - 6}" text-anchor="middle" font-size="10" font-weight="700" fill="#3B82F6">${usdValTxt}</text>
    <text x="${x1 + barW/2}" y="${baseY + 14}" text-anchor="middle" font-size="10" fill="#64748b">${dollarLabel}</text>
    <text x="${x1 + barW/2}" y="${baseY + 26}" text-anchor="middle" font-size="9" fill="#94a3b8">(USD)</text>
    <rect x="${x2}" y="${baseY - khrH}" width="${barW}" height="${khrH}" fill="#10B981" rx="6"/>
    <text x="${x2 + barW/2}" y="${baseY - khrH - 6}" text-anchor="middle" font-size="10" font-weight="700" fill="#10B981">${khrValTxt}</text>
    <text x="${x2 + barW/2}" y="${baseY + 14}" text-anchor="middle" font-size="10" fill="#64748b">${rielLabel}</text>
    <text x="${x2 + barW/2}" y="${baseY + 26}" text-anchor="middle" font-size="9" fill="#94a3b8">(KHR)</text>
    <line x1="20" y1="${baseY}" x2="${W - 20}" y2="${baseY}" stroke="#cbd5e1" stroke-width="1.5"/>
  </svg>`
}

/* ─── PDF Generator ────────────────────────────────────────── */
function buildPdfHtml(contributions, language) {
  const isKm = language === 'km'

  const s = {
    title:        isKm ? 'ប្រព័ន្ធកត់ត្រាប្រាក់' : 'Money Collection',
    subtitle:     isKm ? 'ផ្ទាំងគ្រប់គ្រង'      : 'Admin Dashboard',
    generated:    isKm ? 'កាលបរិច្ឆេទ'          : 'Generated on',
    usdTotal:     isKm ? 'ប្រាក់សរុប (ដុល្លា)'   : 'Total Collected (USD)',
    khrTotal:     isKm ? 'ប្រាក់សរុប (រៀល)'      : 'Total Collected (KHR)',
    participants: isKm ? 'ចំនួនអ្នកចូលរួម'       : 'Total Participants',
    sectionTitle: isKm ? 'បញ្ជីអ្នកចូលរួម'        : 'Contribution Records',
    colNo:        isKm ? 'លរ'                    : '#',
    colName:      isKm ? 'ឈ្មោះ'                 : 'Name',
    colMethod:    isKm ? 'វិធីសាស្ត្រ'           : 'Method',
    colAmount:    isKm ? 'ចំនួនប្រាក់'           : 'Amount',
    colDate:      isKm ? 'កាលបរិច្ឆេទ'           : 'Date',
    noData:       isKm ? 'មិនទាន់មានការចូលរួម'    : 'No contributions recorded.',
  }

  const now = new Date().toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const totalUSD = contributions.filter(c => c.currency === 'USD').reduce((sum, c) => sum + Number(c.amount || 0), 0)
  const totalKHR = contributions.filter(c => c.currency === 'KHR').reduce((sum, c) => sum + Number(c.amount || 0), 0)

  const sorted = contributions
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const rows = sorted.map((c, i) => `
    <tr class="${i % 2 === 0 ? '' : 'row-alt'}">
      <td class="center muted">${i + 1}</td>
      <td class="bold-col">${c.participantName || ''}</td>
      <td class="center">
        <span class="badge ${c.paymentMethod === 'KHQR' ? 'badge-blue' : 'badge-green'}">
          ${c.paymentMethod || ''}
        </span>
      </td>
      <td class="right bold-col">${formatAmount(c.amount || 0, c.currency)}</td>
      <td class="center muted">${new Date(c.createdAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US')}</td>
    </tr>`).join('')

  const fontUrl = isKm
    ? 'https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap'
    : 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap'

  const fontFamily = isKm
    ? "'Noto Sans Khmer','Plus Jakarta Sans',sans-serif"
    : "'Plus Jakarta Sans',sans-serif"

  return `<!DOCTYPE html>
<html lang="${isKm ? 'km' : 'en'}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${s.title} – ${s.sectionTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="${fontUrl}" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{
      font-family:${fontFamily};
      background:#fff;color:#1e293b;
      padding:36px 44px;font-size:12.5px;
      -webkit-print-color-adjust:exact;
      print-color-adjust:exact;
    }
    .top-bar{
      height:5px;
      background:linear-gradient(90deg,#3B82F6 0%,#6366f1 50%,#10B981 100%);
      border-radius:3px;margin-bottom:28px;
    }
    .report-header{
      text-align:center;
      margin-bottom:24px;
      padding-bottom:18px;
      border-bottom:1.5px solid #e2e8f0;
    }
    .brand-row{
      display:flex;align-items:center;justify-content:center;gap:12px;
      margin-bottom:5px;
    }
    .brand-icon{
      width:42px;height:42px;background:#3B82F6;border-radius:11px;
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:20px;font-weight:800;flex-shrink:0;
    }
    .brand-name{font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.4px;}
    .brand-sub{font-size:10.5px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;}
    .report-date-line{font-size:11px;color:#64748b;font-weight:500;}
    .cards{display:flex;gap:12px;margin-bottom:24px;}
    .card{flex:1;padding:12px 15px;border-radius:11px;border:1px solid #e2e8f0;background:#f8fafc;}
    .card.blue  {border-left:4px solid #3B82F6;}
    .card.green {border-left:4px solid #10B981;}
    .card.purple{border-left:4px solid #818cf8;}
    .card-label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#94a3b8;margin-bottom:3px;}
    .card-value{font-size:18px;font-weight:800;color:#0f172a;}
    .section-heading{
      font-size:10px;font-weight:700;text-transform:uppercase;
      letter-spacing:0.8px;color:#64748b;margin-bottom:10px;
    }
    table{width:100%;border-collapse:collapse;border-radius:11px;overflow:hidden;border:1px solid #e2e8f0;}
    thead tr{background:#3B82F6;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    thead th{
      padding:9px 13px;text-align:left;
      font-size:9.5px;font-weight:700;
      text-transform:uppercase;letter-spacing:0.7px;
      color:#fff;white-space:nowrap;
    }
    thead th.center{text-align:center;}
    thead th.right {text-align:right;}
    tbody td{padding:8px 13px;border-bottom:1px solid #f1f5f9;color:#334155;vertical-align:middle;}
    .row-alt{background:#f8fafc;}
    .center{text-align:center;}
    .right {text-align:right;}
    .bold-col{font-weight:700;color:#0f172a;}
    .muted{color:#64748b;}
    .badge{display:inline-block;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:700;}
    .badge-blue {background:#eff6ff;color:#2563eb;}
    .badge-green{background:#ecfdf5;color:#059669;}

    /* ── Mobile & Print fixes ── */
    @page {
      size: A4;
      margin: 15mm 12mm;
    }
    @media print {
      body { padding: 0; }
      .top-bar, .badge, .card, thead tr {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      /* Prevent table rows from breaking across pages */
      tbody tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="top-bar"></div>
  <div class="report-header">
    <div class="brand-row">
      <div class="brand-icon">$</div>
      <span class="brand-name">${s.title}</span>
    </div>
    <div class="brand-sub">${s.subtitle}</div>
    <div class="report-date-line">${s.generated}: ${now}</div>
  </div>
  <div class="cards">
    <div class="card blue">
      <div class="card-label">${s.usdTotal}</div>
      <div class="card-value">$${totalUSD.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
    </div>
    <div class="card green">
      <div class="card-label">${s.khrTotal}</div>
      <div class="card-value">${totalKHR.toLocaleString()} ៛</div>
    </div>
    <div class="card purple">
      <div class="card-label">${s.participants}</div>
      <div class="card-value">${contributions.length}</div>
    </div>
  </div>

  <div class="section-heading">${s.sectionTitle}</div>
  <table>
    <thead>
      <tr>
        <th class="center" style="width:32px">${s.colNo}</th>
        <th>${s.colName}</th>
        <th class="center">${s.colMethod}</th>
        <th class="right">${s.colAmount}</th>
        <th class="center">${s.colDate}</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:18px;">${s.noData}</td></tr>`}
    </tbody>
  </table>
</body>
</html>`
}

/* ─── PDF Download — Blob URL approach (works on desktop + mobile) ─── */
async function downloadPdf(contributions, language) {
  const html = buildPdfHtml(contributions, language)

  // Create a Blob URL from the HTML string.
  // Using a Blob URL instead of window.open('', '_blank') avoids popup
  // blockers on mobile and ensures the new tab contains ONLY the report HTML —
  // not the parent app page. Mobile browsers (iOS Safari, Android Chrome)
  // will then print/save exactly this standalone document.
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)

  const win = window.open(url, '_blank')

  if (win) {
    // Desktop: wait for the new window to load, then auto-trigger print dialog
    win.onload = () => {
      setTimeout(() => {
        win.focus()
        win.print()
        // Revoke the blob URL after printing to free memory
        win.onafterprint = () => {
          URL.revokeObjectURL(url)
        }
        // Fallback revoke in case onafterprint doesn't fire
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
      }, 400)
    }
    // Fallback if onload doesn't fire (some browsers)
    setTimeout(() => {
      try {
        win.focus()
        win.print()
      } catch (_) { /* already printed */ }
    }, 1500)
  } else {
    // Popup was blocked — fall back to a direct download link the user can tap
    const link = document.createElement('a')
    link.href = url
    link.download = `contributions-${new Date().toISOString().slice(0, 10)}.html`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 80000)
  }
}

/* ─── Main Component ──────────────────────────────────────── */
export function ContributionsTable({ showToast, setEditingContribution }) {
  const { t, language } = useLanguage()
  const {
    contributions,
    deleteContribution,
    importContributions,
    clearContributions,
  } = useContributions()

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete)) return
    try {
      await deleteContribution(id)
      showToast(t.contributionDeleted)
    } catch (error) {
      console.error('Error deleting contribution:', error)
      showToast(t.errorDeleting, 'error')
    }
  }

  const [search, setSearch] = useState('')
  const fileRef = useRef(null)

  const filtered = contributions
    .filter(c => (c.participantName || c.name || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  /* ── Export CSV ── */
  const exportCSV = () => {
    const headers = ['Name', 'Method', 'Currency', 'Amount', 'Remark', 'Date']
    const rows = contributions.map(c => [
      c.participantName, c.paymentMethod, c.currency, c.amount, c.remark || '', new Date(c.createdAt).toISOString(),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    link.download = 'contributions.csv'
    link.click()
  }

  /* ── Import CSV ── */
  const importCSV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const lines = ev.target.result.split('\n')
        const newRows = lines.slice(1).filter(l => l.trim()).map(line => {
          const vals = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g).map(v => v.replace(/^"|"$/g, '').trim())
          return {
            participantName: vals[0],
            paymentMethod:   vals[1],
            currency:        vals[2],
            amount:          parseFloat(vals[3]),
            remark:          vals[4] || '',
            createdAt:       vals[5] || new Date().toISOString(),
          }
        })
        await importContributions(newRows)
        showToast(t.csvImported)
      } catch (error) {
        console.error('Error importing CSV:', error)
        showToast(t.csvError, 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  /* ── Clear All ── */
  const handleClearAll = async () => {
    if (contributions.length === 0) return
    if (window.confirm(t.confirmClearAll || 'Delete ALL records? This cannot be undone.')) {
      try {
        await clearContributions()
        showToast(t.allCleared || 'All records cleared')
      } catch (error) {
        console.error('Error clearing contributions:', error)
        showToast(t.errorClearing, 'error')
      }
    }
  }

  const btnCls = "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
  const dangerBtnCls = "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">{t.contributionList}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} {t.totalEntries}</p>
          </div>
          <div className="relative w-full sm:w-[220px] sm:flex-shrink-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
            <input
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto scrollbar-thin" style={{ maxHeight: '360px' }}>
            <table className="text-[15px] border-collapse" style={{ minWidth: '560px', width: '100%' }}>
              <colgroup>
                {['110px','90px','110px','90px','70px','100px'].map((w) => (
                  <col key={w} style={{ width: w }} />
                ))}
              </colgroup>

              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  {[t.name, t.method, t.amountCol, t.dateCol, t.actions, t.remarkCol].map((col, idx) => (
                    <th
                      key={col}
                      className={`px-3 py-3 text-[15px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap
                        ${idx === 1 ? 'text-center' : idx === 2 ? 'text-right' : 'text-left'}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors
                      ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-700/20'}`}
                  >
                    <td className="px-3 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {c.participantName}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                        c.paymentMethod === 'KHQR'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}>
                        {c.paymentMethod}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap text-right">
                      {formatAmount(c.amount, c.currency)}
                    </td>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-sm">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingContribution(c)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {c.remark || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                {t.noContributions}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 no-print">
          <button className={btnCls} onClick={() => { void downloadPdf(contributions, language) }}>
            <DownloadIcon />{t.downloadPDF}
          </button>
          <button className={btnCls} onClick={exportCSV}>
            <ExportIcon />{t.exportCSV}
          </button>
          <button className={btnCls} onClick={() => fileRef.current.click()}>
            <ImportIcon />{t.importCSV}
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={importCSV} className="hidden" />
          <button className={dangerBtnCls} onClick={handleClearAll} disabled={contributions.length === 0}>
            <ClearAllIcon />{t.clearAll || 'Clear All'}
          </button>
        </div>
      </div>
    </>
  )
}