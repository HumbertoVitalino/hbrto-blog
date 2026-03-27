'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/infrastructure/supabase/client'

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  // Fetch user on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data?.session || null)
        
        if (data?.session?.user) {
          // Get user metadata with role
          const userEmail = data.session.user.email || ''
          // Check if it's admin (we'll use a simple check or a users table)
          setUser({
            id: data.session.user.id,
            email: userEmail,
            role: userEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? 'admin' : 'user'
          })
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          const userEmail = session.user.email || ''
          setUser({
            id: session.user.id,
            email: userEmail,
            role: userEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? 'admin' : 'user'
          })
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
    } catch (error) {
      throw error
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin: user?.role === 'admin' || false,
      login,
      logout,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
