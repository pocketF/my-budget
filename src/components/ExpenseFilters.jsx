export default function ExpenseFilters({
  sortOrder,
  onSortOrderChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}) {
  return (
    <div>
      <label>
        시작일
        <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
      </label>

      <label>
        종료일
        <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
      </label>

      <label>
        정렬
        <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)}>
          <option value="desc">최신순</option>
          <option value="asc">오래된순</option>
        </select>
      </label>
    </div>
  )
}
