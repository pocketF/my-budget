import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000
const LAST_ACTIVITY_KEY = 'my-budget:lastActivityAt'
const INTERACTION_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll']

function recordActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
}

function isExpired() {
  const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0)
  return lastActivity > 0 && Date.now() - lastActivity > INACTIVITY_LIMIT_MS
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      const {
        data: { session: current },
      } = await supabase.auth.getSession()

      if (current && isExpired()) {
        await supabase.auth.signOut()
        localStorage.removeItem(LAST_ACTIVITY_KEY)
        if (mounted) setLoading(false)
        return
      }

      if (current) recordActivity()

      if (mounted) {
        setSession(current)
        setLoading(false)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      if (event === 'SIGNED_IN') recordActivity()
      if (event === 'SIGNED_OUT') localStorage.removeItem(LAST_ACTIVITY_KEY)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const hasSession = Boolean(session)

  useEffect(() => {
    if (!hasSession) return

    function scheduleTimeout() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        supabase.auth.signOut()
      }, INACTIVITY_LIMIT_MS)
    }

    function handleActivity() {
      recordActivity()
      scheduleTimeout()
    }

    function handleVisibility() {
      if (document.visibilityState !== 'visible') return
      if (isExpired()) {
        supabase.auth.signOut()
        return
      }
      handleActivity()
    }

    scheduleTimeout()
    INTERACTION_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity))
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      INTERACTION_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity))
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [hasSession])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
