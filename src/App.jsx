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
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:py-10">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">가계부</h1>
          <p className="mt-1 text-sm text-slate-500">지출을 기록하고 한눈에 확인하세요</p>
        </header>

        <AuthForm />

        {user ? (
          <>
            <ExpenseForm
              userId={user.id}
              onAdded={(row) => setExpenses((prev) => [row, ...prev])}
            />

            <ExpenseSummary expenses={expenses} />

            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">지출 내역</h2>

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
            </section>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 sm:p-10">
            로그인하면 지출을 기록할 수 있어요.
          </div>
        )}
      </div>
    </div>
  )
}

export default App
