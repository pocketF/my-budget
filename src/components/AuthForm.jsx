import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthForm() {
  const { user, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const isLoggedIn = Boolean(user)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      if (mode === 'signIn') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setMessage('회원가입을 축하합니다!')
      }
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function toggleMode() {
    setMode(mode === 'signIn' ? 'signUp' : 'signIn')
    setError(null)
    setMessage(null)
  }

  if (isLoggedIn) {
    return (
      <div>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        <span>{user.email} 로그인됨</span>
        <button type="button" onClick={signOut}>
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit" disabled={submitting}>
          {mode === 'signIn' ? '로그인' : '회원가입'}
        </button>
      </form>
      <button type="button" onClick={toggleMode}>
        {mode === 'signIn' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
      </button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
