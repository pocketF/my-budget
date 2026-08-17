import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useAuth } from './context/AuthContext'
import AuthForm from './components/AuthForm'
import ExpenseForm from './components/ExpenseForm'
import ExpenseFilters from './components/ExpenseFilters'
import ExpenseList from './components/ExpenseList'
import ExpenseSummary from './components/ExpenseSummary'

function App() {
  const { user, loading } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [sortOrder, setSortOrder] = useState('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const visibleExpenses = useMemo(() => {
    const filtered = expenses.filter((e) => {
      if (dateFrom && e.date < dateFrom) return false
      if (dateTo && e.date > dateTo) return false
      return true
    })

    return filtered.sort((a, b) =>
      sortOrder === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
    )
  }, [expenses, sortOrder, dateFrom, dateTo])

  useEffect(() => {
    if (!user) return

    supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setExpenses(data)
      })
  }, [user])

  if (loading) {
    return <p>로딩 중...</p>
  }

  return (
    <div>
      <h1>가계부</h1>

      <AuthForm />

      {user ? (
        <>
          <ExpenseForm
            userId={user.id}
            onAdded={(row) => setExpenses((prev) => [row, ...prev])}
          />

          <ExpenseSummary expenses={expenses} />

          <ExpenseFilters
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
          />

          <ExpenseList
            expenses={visibleExpenses}
            onUpdated={(row) =>
              setExpenses((prev) => prev.map((e) => (e.id === row.id ? row : e)))
            }
            onDeleted={(id) => setExpenses((prev) => prev.filter((e) => e.id !== id))}
          />
        </>
      ) : (
        <p>로그인하면 지출을 기록할 수 있어요.</p>
      )}
    </div>
  )
}

export default App
