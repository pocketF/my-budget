import { CATEGORIES } from '../lib/categories'

export default function ExpenseSummary({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const byCategory = CATEGORIES.map((category) => ({
    category,
    total: expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + Number(e.amount), 0),
  }))

  return (
    <div>
      <p>총 지출: {total.toLocaleString()}원</p>
      <ul>
        {byCategory.map(({ category, total: categoryTotal }) => (
          <li key={category}>
            {category}: {categoryTotal.toLocaleString()}원
          </li>
        ))}
      </ul>
    </div>
  )
}
