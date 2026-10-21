'use client'

import { useMemo, useState } from 'react'
import { Loader2, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { useSubscribers } from '@/app/hooks/useSubscribers'
import { supabase } from '@/infrastructure/supabase/client'
import { daysSince } from '@/lib/adminOverview'
import { fieldClass } from '@/app/components/habits/FormBits'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** Who's subscribed, and an email to all of them. Sending and removing both ask first. */
export function NewsletterPanel({ subscribers, isLoading, removeSubscriber }: Pick<ReturnType<typeof useSubscribers>, 'subscribers' | 'isLoading' | 'removeSubscriber'>) {
    const [composing, setComposing] = useState(false)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
    const [sendError, setSendError] = useState('')
    const [confirmSend, setConfirmSend] = useState(false)
    const [pendingRemove, setPendingRemove] = useState<string | null>(null)
    const [removing, setRemoving] = useState<string | null>(null)

    const now = useMemo(() => new Date(), [])
    const newest = useMemo(() => [...subscribers].sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt)), [subscribers])
    const recent = subscribers.filter(s => daysSince(s.subscribedAt, now) <= 30).length
    const recipients = `${subscribers.length} ${subscribers.length === 1 ? 'subscriber' : 'subscribers'}`

    const send = async () => {
        setConfirmSend(false)
        setStatus('sending')
        setSendError('')
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch('/api/newsletter/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: session?.access_token ? `Bearer ${session.access_token}` : '' },
                body: JSON.stringify({ subject, message }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error || 'Failed to send')
            setStatus('sent')
            setSubject('')
            setMessage('')
            toast.success('Newsletter sent')
        } catch (err) {
            setStatus('error')
            setSendError(err instanceof Error ? err.message : 'Failed to send')
        }
    }

    const remove = async () => {
        if (!pendingRemove) return
        setRemoving(pendingRemove)
        try {
            await removeSubscriber(pendingRemove)
            toast.success('Subscriber removed')
        } finally {
            setRemoving(null)
            setPendingRemove(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-5 w-5 animate-spin rounded-full border border-muted border-t-foreground" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[13px] text-muted-foreground">Subscribed now</p>
                    <p className="text-4xl font-semibold leading-tight tracking-tight">{subscribers.length}</p>
                    <p className="text-[13px] text-muted-foreground">{recent} new in the last 30 days</p>
                </div>
                {subscribers.length > 0 && (
                    <button
                        type="button"
                        onClick={() => { setComposing(c => !c); setStatus('idle') }}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-transform duration-100 active:scale-[0.97]',
                            composing ? 'text-muted-foreground ring-1 ring-inset ring-border hover:text-foreground' : 'bg-primary text-primary-foreground',
                        )}
                    >
                        {composing ? 'Cancel' : <><Send className="size-3.5" />Write an email</>}
                    </button>
                )}
            </div>

            {composing && (
                <section aria-label="New email" className="raised-card px-5 py-5">
                    {status === 'sent' ? (
                        <div className="py-4 text-center">
                            <p className="text-sm font-medium">Sent to {recipients}.</p>
                            <button type="button" onClick={() => { setStatus('idle'); setComposing(false) }} className="mt-2 text-[13px] font-medium text-brand-accent hover:underline">
                                Done
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={e => { e.preventDefault(); setConfirmSend(true) }} className="grid grid-cols-1 gap-3">
                            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" aria-label="Subject" required disabled={status === 'sending'} className={fieldClass} />
                            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message…" aria-label="Message" required rows={7} disabled={status === 'sending'} className={cn(fieldClass, 'resize-y')} />
                            {status === 'error' && <p role="alert" className="text-sm text-destructive-text">{sendError}</p>}
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[13px] text-muted-foreground">Goes to {recipients}</span>
                                <button type="submit" disabled={status === 'sending'} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-[opacity,transform] duration-100 active:scale-[0.97] disabled:opacity-60">
                                    {status === 'sending' ? <><Loader2 className="size-3.5 animate-spin" />Sending…</> : <><Send className="size-3.5" />Send</>}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            )}

            <section aria-labelledby="subscribers-heading">
                <h2 id="subscribers-heading" className="mb-4 text-sm font-semibold">Subscribers</h2>
                {newest.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No subscribers yet. Share the site and they’ll show up here.</p>
                ) : (
                    <ul className="raised-card divide-y divide-border py-1">
                        {newest.map(s => (
                            <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm">{s.email}</p>
                                    <p className="text-[13px] tabular-nums text-muted-foreground">Since {date.format(new Date(s.subscribedAt))}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPendingRemove(s.email)}
                                    disabled={removing === s.email}
                                    aria-label={`Remove ${s.email}`}
                                    className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive-text disabled:opacity-40"
                                >
                                    {removing === s.email ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <AlertDialog open={!!pendingRemove} onOpenChange={open => !open && setPendingRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove this subscriber?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This can’t be undone. {pendingRemove} will stop getting emails and would have to subscribe again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel />
                        <AlertDialogAction onClick={remove}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirmSend} onOpenChange={setConfirmSend}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Send this email?</AlertDialogTitle>
                        <AlertDialogDescription>
                            “{subject || 'This message'}” goes to all {recipients} right now. It can’t be unsent.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel />
                        <AlertDialogAction onClick={send}>Send</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
