import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIES } from '../lib/categories'
import { validateAmount } from '../lib/validation'

const fieldClass =
  'rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10'

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
    return (
      <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
        기록된 지출이 없습니다.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {expenses.map((expense) => {
        if (editingId === expense.id) {
          return (
            <div
              key={expense.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 p-3"
            >
              <input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className={`w-full sm:w-auto ${fieldClass}`}
              />
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className={`w-full sm:w-auto ${fieldClass}`}
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
                className={`w-full sm:w-24 ${fieldClass}`}
              />
              <input
                type="text"
                value={draft.memo}
                onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
                className={`w-full min-w-0 flex-1 ${fieldClass}`}
              />
              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => saveEdit(expense.id)}
                  disabled={savingId === expense.id}
                  className="flex-1 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 sm:flex-none"
                >
                  {savingId === expense.id ? '저장 중...' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 sm:flex-none"
                >
                  취소
                </button>
              </div>
            </div>
          )
        }

        return (
          <div
            key={expense.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-400">{expense.date}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {expense.category}
              </span>
              <span className="font-semibold text-slate-900">
                {Number(expense.amount).toLocaleString()}원
              </span>
              {expense.memo && (
                <span className="min-w-0 break-words text-slate-500">{expense.memo}</span>
              )}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => startEdit(expense)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingId === expense.id ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
