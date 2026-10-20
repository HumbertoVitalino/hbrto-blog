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
    if (!email.trim()) {
      setState({ kind: 'error', message: 'Enter your email address to subscribe.' })
      return
    }
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
    // a container query, not a viewport one: the box stacks in a narrow reading column and
    // lays out as one row (words left, form right) once it's given the full content width
    <section aria-labelledby={`${id}-title`} className={cn('@container rounded-2xl border border-border bg-card p-6', className)}>
      <div className="flex flex-col gap-5 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-10">
      <div className="min-w-0">
        <h2 id={`${id}-title`} className="flex items-center gap-3 text-sm font-semibold">
          <Mail className="size-5 text-muted-foreground" aria-hidden />
          Get new notes by email
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          One email when I publish a note. Nothing else, and you can leave any time.
        </p>
      </div>

      {state.kind === 'done' ? (
        <p role="status" className="text-sm @3xl:shrink-0">You’re in. Check your inbox for a welcome email.</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-wrap gap-3 @3xl:w-md @3xl:shrink-0">
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
            // the edge is drawn inside the fill (inset ring, not a border), so the field reads exactly as tall
            // as the button; text-base on phones stops iOS zooming in
            className="h-10 min-w-0 flex-[1_1_12rem] rounded-md bg-card px-3 text-base shadow-sm shadow-foreground/5 ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-white/4 sm:text-sm"
          />
          <button
            type="submit"
            disabled={state.kind === 'sending'}
            className="h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-[opacity,transform] duration-100 ease-out hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
          >
            {state.kind === 'sending' ? 'Subscribing…' : 'Subscribe'}
          </button>
          {state.kind === 'error' && (
            <p id={`${id}-error`} role="alert" className="basis-full text-sm text-destructive-text">{state.message}</p>
          )}
        </form>
      )}
      </div>
    </section>
  )
}
