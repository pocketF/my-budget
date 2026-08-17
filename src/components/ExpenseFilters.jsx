const fieldClass =
  'rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10'

export default function ExpenseFilters({
  sortOrder,
  onSortOrderChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-3">
      <label className="space-y-1 text-xs text-slate-500">
        <span>시작일</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className={`block ${fieldClass}`}
        />
      </label>

      <label className="space-y-1 text-xs text-slate-500">
        <span>종료일</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className={`block ${fieldClass}`}
        />
      </label>

      <label className="space-y-1 text-xs text-slate-500">
        <span>정렬</span>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className={`block ${fieldClass}`}
        >
          <option value="desc">최신순</option>
          <option value="asc">오래된순</option>
        </select>
      </label>
    </div>
  )
}
