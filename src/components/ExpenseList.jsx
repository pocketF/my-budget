import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIES } from '../lib/categories'
import { validateAmount } from '../lib/validation'

export default function ExpenseList({ expenses, onUpdated, onDeleted }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  function startEdit(expense) {
    setEditingId(expense.id)
    setDraft({
      date: expense.date,
      category: expense.category,
      amount: String(expense.amount),
      memo: expense.memo ?? '',
    })
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft(null)
    setError(null)
  }

  async function saveEdit(id) {
    const amountError = validateAmount(draft.amount)
    if (amountError) {
      setError(amountError)
      return
    }

    setSavingId(id)
    setError(null)

    const { data, error } = await supabase
      .from('expenses')
      .update({
        date: draft.date,
        category: draft.category,
        amount: Number(draft.amount),
        memo: draft.memo || null,
      })
      .eq('id', id)
      .select()
      .single()

    setSavingId(null)

    if (error) {
      setError(error.message)
      return
    }

    onUpdated?.(data)
    setEditingId(null)
    setDraft(null)
  }

  async function handleDelete(id) {
    setDeletingId(id)
    setError(null)

    const { error } = await supabase.from('expenses').delete().eq('id', id)

    setDeletingId(null)

    if (error) {
      setError(error.message)
      return
    }

    onDeleted?.(id)
  }

  if (expenses.length === 0) {
    return <p>기록된 지출이 없습니다.</p>
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {expenses.map((expense) => {
          if (editingId === expense.id) {
            return (
              <li key={expense.id}>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={draft.amount}
                  onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                />
                <input
                  type="text"
                  value={draft.memo}
                  onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
                />
                <button type="button" onClick={() => saveEdit(expense.id)} disabled={savingId === expense.id}>
                  {savingId === expense.id ? '저장 중...' : '저장'}
                </button>
                <button type="button" onClick={cancelEdit}>
                  취소
                </button>
              </li>
            )
          }

          return (
            <li key={expense.id}>
              {expense.date} · {expense.category} · {Number(expense.amount).toLocaleString()}원 · {expense.memo}
              <button type="button" onClick={() => startEdit(expense)}>
                수정
              </button>
              <button
                type="button"
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
              >
                {deletingId === expense.id ? '삭제 중...' : '삭제'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
