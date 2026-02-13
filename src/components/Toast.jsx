/*  <components />Toast.jsx - Toast notification component for success/error messages*/

import { useEffect } from 'react'

export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const isSuccess = type === 'success'

  return (
    <div
      className={`
        flex items-center gap-3 min-w-[300px] px-4 py-3 rounded-xl shadow-xl
        bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
        animate-slide-in
        ${isSuccess ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'}
      `}
    >
      <span className="text-xl">{isSuccess ? '✓' : '⚠'}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{message}</span>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col gap-2 no-print">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}
