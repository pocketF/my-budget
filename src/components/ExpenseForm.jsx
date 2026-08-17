import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIES } from '../lib/categories'
import { validateAmount } from '../lib/validation'

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
    <form onSubmit={handleSubmit}>
      <label>
        날짜
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <label>
        카테고리
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        금액
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>

      <label>
        메모
        <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} />
      </label>

      <button type="submit" disabled={saving}>
        {saving ? '저장 중...' : '추가'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
