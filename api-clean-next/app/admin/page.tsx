'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useSubscribers } from '@/app/hooks/useSubscribers'
import { PageContainer } from '@/app/components/layout/PageHeader'
import { Segmented } from '@/app/components/layout/Segmented'
import { HabitTracker, TRACKER_VIEW_TITLE, type TrackerView } from '@/app/components/habits/HabitTracker'
import { AdminOverview } from '@/app/components/admin/AdminOverview'
import { NewsletterPanel } from '@/app/components/admin/NewsletterPanel'

type Tab = 'tracker' | 'overview' | 'newsletter'

function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const subscribers = useSubscribers()
  const [tab, setTab] = useState<Tab>('tracker')
  const [trackerView, setTrackerView] = useState<TrackerView>('today')

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin/login')
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border border-muted border-t-foreground" />
      </div>
    )
  }

  if (!user) return null

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: 'tracker', label: 'Tracker' },
    { value: 'overview', label: 'Overview' },
    { value: 'newsletter', label: 'Newsletter', count: subscribers.isLoading ? undefined : subscribers.subscribers.length },
  ]

  const title = tab === 'tracker'
    ? TRACKER_VIEW_TITLE[trackerView]
    : tab === 'overview' ? `${greeting()}, Humberto.` : 'Newsletter'

  return (
    <PageContainer>
      <header className="pt-10 sm:pt-16">
        <p className="text-[13px] font-semibold text-muted-foreground">Admin</p>
        <h1 className="mt-1 text-[2rem] font-semibold leading-10 tracking-tight sm:text-[2.75rem] sm:leading-13">{title}</h1>
        <div className="mt-6">
          <Segmented id="admin-tab" label="Admin section" options={tabs} value={tab} onChange={setTab} />
        </div>
      </header>

      <div className={tab === 'tracker' ? 'mx-auto mt-8 max-w-xl' : tab === 'overview' ? 'mt-8 max-w-5xl' : 'mt-10 max-w-3xl'}>
        {tab === 'tracker' && <HabitTracker view={trackerView} onViewChange={setTrackerView} />}
        {tab === 'overview' && <AdminOverview subscribers={subscribers.subscribers} subscribersLoading={subscribers.isLoading} />}
        {tab === 'newsletter' && (
          <NewsletterPanel subscribers={subscribers.subscribers} isLoading={subscribers.isLoading} removeSubscriber={subscribers.removeSubscriber} />
        )}
      </div>
    </PageContainer>
  )
}
