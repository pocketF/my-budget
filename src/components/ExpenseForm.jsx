import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIES } from '../lib/categories'
import { validateAmount } from '../lib/validation'

const fieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function ExpenseForm({ userId, onAdded }) {
  const [date, setDate] = useState(todayStr())
  const [category, setCategory] = useState(CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()

    const amountError = validateAmount(amount)
    if (amountError) {
      setError(amountError)
      return
    }

    setSaving(true)
    setError(null)

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        date,
        category,
        amount: Number(amount),
        memo: memo || null,
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setAmount('')
    setMemo('')
    onAdded?.(data)
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">지출 추가</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="min-w-0 space-y-1 text-sm text-slate-600">
            <span>날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={`min-w-0 max-w-full ${fieldClass}`}
            />
          </label>

          <label className="min-w-0 space-y-1 text-sm text-slate-600">
            <span>카테고리</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`min-w-0 max-w-full ${fieldClass}`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 space-y-1 text-sm text-slate-600">
            <span>금액</span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className={`min-w-0 max-w-full ${fieldClass}`}
            />
          </label>

          <label className="min-w-0 space-y-1 text-sm text-slate-600">
            <span>메모</span>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className={`min-w-0 max-w-full ${fieldClass}`}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? '저장 중...' : '추가'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}
