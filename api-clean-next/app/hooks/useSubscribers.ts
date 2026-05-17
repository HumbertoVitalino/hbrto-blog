'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/infrastructure/supabase/client'

export interface SubscriberPlain {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
}

export function useSubscribers() {
  const [subscribers, setSubscribers] = useState<SubscriberPlain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? `Bearer ${session.access_token}` : undefined
  }

  const fetchSubscribers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = await getAuthHeader()
      const response = await fetch('/api/newsletter/subscribers', {
        headers: { ...(token && { Authorization: token }) }
      })

      if (!response.ok) throw new Error('Failed to fetch subscribers')

      const data = await response.json()
      setSubscribers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message)
      setSubscribers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeSubscriber = useCallback(async (email: string) => {
    try {
      const token = await getAuthHeader()
      const response = await fetch('/api/newsletter/subscribers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: token })
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove subscriber')
      }

      setSubscribers(prev => prev.filter(s => s.email !== email))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  return { subscribers, isLoading, error, removeSubscriber, refetch: fetchSubscribers }
}
