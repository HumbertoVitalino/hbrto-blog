'use client'

import { useId, useState } from 'react'
import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; message: string }

export function NotesSubscribe({ className }: { className?: string }) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState({ kind: 'error', message: 'That email address doesn’t look complete.' })
      return
    }
    setState({ kind: 'sending' })
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(json.error || 'The subscription didn’t go through. Try again in a minute.')
      setState({ kind: 'done' })
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'The subscription didn’t go through.' })
    }
  }

  return (
    <section aria-labelledby={`${id}-title`} className={cn('rounded-2xl border border-border bg-card p-6', className)}>
      <h2 id={`${id}-title`} className="flex items-center gap-3 text-sm font-semibold">
        <Mail className="size-5 text-muted-foreground" aria-hidden />
        Get new notes by email
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        One email when I publish a note. Nothing else, and you can leave any time.
      </p>

      {state.kind === 'done' ? (
        <p role="status" className="mt-5 text-sm">You’re in. Check your inbox for a welcome email.</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-wrap gap-3">
          <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); if (state.kind === 'error') setState({ kind: 'idle' }) }}
            placeholder="you@example.com"
            aria-invalid={state.kind === 'error'}
            aria-describedby={state.kind === 'error' ? `${id}-error` : undefined}
            className="min-w-0 flex-[1_1_12rem] rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-brand-accent focus:outline-none focus:ring-3 focus:ring-brand-accent/20"
          />
          <button
            type="submit"
            disabled={state.kind === 'sending'}
            className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {state.kind === 'sending' ? 'Subscribing…' : 'Subscribe'}
          </button>
          {state.kind === 'error' && (
            <p id={`${id}-error`} role="alert" className="basis-full text-sm text-destructive-text">{state.message}</p>
          )}
        </form>
      )}
    </section>
  )
}
