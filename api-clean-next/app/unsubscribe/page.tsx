'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function UnsubscribeContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email')

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!email) {
            setStatus('error')
            setMessage('No email address provided.')
            return
        }

        fetch(`/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`)
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Something went wrong')
                setStatus('success')
            })
            .catch((err) => {
                setStatus('error')
                setMessage(err.message)
            })
    }, [email])

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
                    humbertovitalino.com.br
                </p>

                {status === 'loading' && (
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full border border-muted border-t-foreground animate-spin" />
                        <p className="text-sm text-muted-foreground">Unsubscribing...</p>
                    </div>
                )}

                {status === 'success' && (
                    <>
                        <h1 className="text-3xl font-bold tracking-tight mb-4">You're unsubscribed.</h1>
                        <p className="text-muted-foreground leading-relaxed mb-8">
                            <span className="text-foreground font-medium">{email}</span> has been removed from the newsletter. You won't receive any more emails.
                        </p>
                        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                            Back to site
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h1 className="text-3xl font-bold tracking-tight mb-4">Something went wrong.</h1>
                        <p className="text-muted-foreground leading-relaxed mb-8">{message}</p>
                        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                            Back to site
                        </Link>
                    </>
                )}
            </div>
        </main>
    )
}

export default function UnsubscribePage() {
    return (
        <Suspense>
            <UnsubscribeContent />
        </Suspense>
    )
}
