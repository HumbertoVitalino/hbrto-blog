'use client'

import { useState } from "react"

export function SubscribeForm() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus("loading")

        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Erro ao se cadastrar")
            }

            setStatus("success")
            setMessage("Cadastrado com sucesso! Você receberá os próximos reviews por email.")
            setEmail("")
        } catch (error: any) {
            setStatus("error")
            setMessage(error.message)
        }
    }

    return (
        <div className="border rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold mb-1">Newsletter</h2>
            <p className="text-sm text-muted-foreground mb-4">
                Receba os novos reviews diretamente no seu email.
            </p>

            {status === "success" ? (
                <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={status === "loading"}
                        className="border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />

                    {status === "error" && (
                        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="bg-foreground text-background rounded px-4 py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                    >
                        {status === "loading" ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>
            )}
        </div>
    )
}
