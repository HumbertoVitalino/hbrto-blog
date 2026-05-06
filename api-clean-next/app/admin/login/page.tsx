'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, resetPassword, user, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  useEffect(() => {
    if (user && !authLoading) router.push('/admin')
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Email and password are required'); return }
    try {
      setIsLoading(true)
      await login(email, password)
      toast.success('Signed in')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error signing in'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!resetEmail) { setError('Enter your email'); return }
    try {
      setIsLoading(true)
      await resetPassword(resetEmail)
      toast.success('Recovery email sent')
      setIsForgotPassword(false)
      setResetEmail('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error sending email'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/10">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-10 h-10 rounded-xl bg-foreground items-center justify-center mb-4">
            <span className="text-background font-bold text-sm">HV</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isForgotPassword ? 'Reset password' : 'Admin access'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isForgotPassword
              ? 'Enter your email to receive a recovery link'
              : 'Sign in to manage your blog'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send recovery link
              </Button>
              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setError(null) }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sign in
              </Button>

              <button
                type="button"
                onClick={() => { setIsForgotPassword(true); setError(null) }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
