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
    <div>
      <p>총 지출: {total.toLocaleString()}원</p>

      <div>
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            disabled={view === v.key}
          >
            {v.label}
          </button>
        ))}
      </div>

      <ul>
        {rows.map(([label, amount]) => (
          <li key={label}>
            {label}: {amount.toLocaleString()}원
          </li>
        ))}
      </ul>
    </div>
  )
}
