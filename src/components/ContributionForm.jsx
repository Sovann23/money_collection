/* <components />ContributionForm.jsx - Form for adding/editing contributions*/

import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useContributions } from '../contexts/ContributionsContext'

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const KhqrIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const CashIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const EMPTY = { name: '', method: '', currency: '', amount: '', remark: '' }

export function ContributionForm({ showToast, editingContribution, setEditingContribution }) {
  const { t } = useLanguage()
  const { addContribution, updateContribution } = useContributions()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingContribution) {
      setForm({ ...editingContribution, amount: editingContribution.amount.toString() })
    }
  }, [editingContribution])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())                  e.name   = t.requiredField
    if (!form.method)                        e.method = t.requiredField
    if (!form.currency)                      e.currency = t.requiredField
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = t.invalidAmount
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const data = { ...form, amount: parseFloat(form.amount) }
    if (editingContribution) {
      updateContribution(editingContribution.id, data)
      showToast(t.contributionUpdated)
      setEditingContribution(null)
    } else {
      addContribution(data)
      showToast(t.contributionAdded)
    }
    setForm(EMPTY)
  }

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"

  const optionBtn = (active, green) =>
    `flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all
    ${active
      ? green
        ? 'bg-emerald-500 border-emerald-500 text-white'
        : 'bg-blue-500 border-blue-500 text-white'
      : 'bg-gray-50 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
    }`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      {/* Card header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
          <PlusIcon />
        </div>
        <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-50">{t.addContribution}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">{t.participantName}</label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder={t.enterParticipantName} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">{t.paymentMethod}</label>
          <div className="flex gap-2">
            <button type="button" className={optionBtn(form.method === 'KHQR', false)} onClick={() => set('method', 'KHQR')}>
              <KhqrIcon />{t.khqr}
            </button>
            <button type="button" className={optionBtn(form.method === 'Cash', true)} onClick={() => set('method', 'Cash')}>
              <CashIcon />{t.cash}
            </button>
          </div>
          {errors.method && <p className="text-red-500 text-xs mt-1">{errors.method}</p>}
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">{t.currency}</label>
          <div className="flex gap-2">
            <button type="button" className={optionBtn(form.currency === 'USD', false)} onClick={() => set('currency', 'USD')}>
              $ {t.dollar}
            </button>
            <button type="button" className={optionBtn(form.currency === 'KHR', true)} onClick={() => set('currency', 'KHR')}>
              ៛ {t.riel}
            </button>
          </div>
          {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">{t.amount}</label>
          <input type="number" className={inputCls} value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">{t.remark}</label>
          <input className={inputCls} value={form.remark} onChange={e => set('remark', e.target.value)} placeholder={t.addNotes} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button type="submit" className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            {editingContribution ? t.update : t.recordContribution}
          </button>
          {editingContribution && (
            <button type="button" onClick={() => { setEditingContribution(null); setForm(EMPTY) }}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm border border-gray-200 dark:border-gray-600 transition-all">
              {t.cancel}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
