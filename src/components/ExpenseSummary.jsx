import { useState } from 'react'
import { CATEGORIES } from '../lib/categories'
import { getWeekStart, getMonthKey } from '../lib/dateGroups'

const VIEWS = [
  { key: 'category', label: '카테고리별' },
  { key: 'day', label: '일별' },
  { key: 'week', label: '주별' },
  { key: 'month', label: '월별' },
]

function groupTotals(expenses, keyFn) {
  const totals = new Map()
  for (const e of expenses) {
    const key = keyFn(e)
    totals.set(key, (totals.get(key) ?? 0) + Number(e.amount))
  }
  return [...totals.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
}

export default function ExpenseSummary({ expenses }) {
  const [view, setView] = useState('category')

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  let rows
  if (view === 'category') {
    rows = CATEGORIES.map((category) => [
      category,
      expenses
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + Number(e.amount), 0),
    ])
  } else if (view === 'day') {
    rows = groupTotals(expenses, (e) => e.date)
  } else if (view === 'week') {
    rows = groupTotals(expenses, (e) => `${getWeekStart(e.date)} 주`)
  } else {
    rows = groupTotals(expenses, (e) => getMonthKey(e.date))
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <p className="text-sm text-slate-500">총 지출</p>
        <p className="text-3xl font-bold text-slate-900">{total.toLocaleString()}원</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            disabled={view === v.key}
            className={
              view === v.key
                ? 'rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white'
                : 'rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200'
            }
          >
            {v.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">표시할 내역이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rows.map(([label, amount]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
            >
              <p className="truncate text-xs text-slate-500">{label}</p>
              <p className="text-sm font-semibold text-slate-900">
                {amount.toLocaleString()}원
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
