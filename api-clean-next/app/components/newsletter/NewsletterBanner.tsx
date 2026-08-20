'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'newsletter_status'

export function NewsletterBanner() {
    const [visible, setVisible] = useState(false)
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'subscribed' || stored === 'dismissed') return

        const timer = setTimeout(() => setVisible(true), 3000)
        return () => clearTimeout(timer)
    }, [])

    function dismiss() {
        localStorage.setItem(STORAGE_KEY, 'dismissed')
        setVisible(false)
    }

    async function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault()
        setStatus('loading')

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar')

            localStorage.setItem(STORAGE_KEY, 'subscribed')
            setStatus('success')
        } catch (error: any) {
            setStatus('error')
            setErrorMsg(error.message)
        }
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-0 right-0 left-0 z-50 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 rounded-none sm:rounded-2xl border-t sm:border border-border/60 bg-card shadow-lg p-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>

            {status === 'success' ? (
                <div className="pr-4">
                    <p className="font-semibold mb-1">You're in!</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You'll receive new reviews directly in your inbox.
                    </p>
                </div>
            ) : (
                <>
                    <p className="font-semibold mb-1 pr-4">Stay in the loop</p>
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                        Get new reviews delivered straight to your inbox. No spam.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={status === 'loading'}
                            className="border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 w-full"
                        />

                        {status === 'error' && (
                            <p className="text-sm text-destructive">{errorMsg}</p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 w-full"
                        >
                            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}
