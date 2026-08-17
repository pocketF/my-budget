import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useAuth } from './context/AuthContext'
import AuthForm from './components/AuthForm'
import ExpenseForm from './components/ExpenseForm'
import ExpenseSummary from './components/ExpenseSummary'

function App() {
  const { user, loading } = useAuth()
  const [expenses, setExpenses] = useState([])

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

          <ul>
            {expenses.map((e) => (
              <li key={e.id}>
                {e.date} · {e.category} · {e.amount}원 · {e.memo}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>로그인하면 지출을 기록할 수 있어요.</p>
      )}
    </div>
  )
}

export default App
