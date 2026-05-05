'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut } from 'lucide-react'

export default function Header() {
  const { user, isAdmin, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* CONTAINER PRINCIPAL USANDO FLEX INVES DE GRID */}
        <div className="flex h-16 items-center justify-between">

          {/* LEFT - Logo */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="font-bold text-xl whitespace-nowrap">
              Humberto Vitalino
            </Link>
          </div>

          {/* CENTER - Navigation (Desktop) */}
          <nav className="hidden md:flex items-center justify-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/library" className="text-sm font-medium hover:text-primary transition-colors">
              Library
            </Link>
            <Link href="/reviews" className="text-sm font-medium hover:text-primary transition-colors">
              Reviews
            </Link>
            <Link href="/music" className="text-sm font-medium hover:text-primary transition-colors">
              Music
            </Link>
          </nav>

          {/* RIGHT - Auth + Mobile Button */}
          <div className="flex flex-1 items-center justify-end gap-4">

            {/* Desktop Auth */}
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -mr-2 hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        {isOpen && (
          <nav className="md:hidden border-t py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/library"
              className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Library
            </Link>
            <Link
              href="/reviews"
              className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Reviews
            </Link>
            <Link
              href="/music"
              className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Music
            </Link>

            {user && (
              <div className="border-t mt-4 pt-4 px-4">
                <p className="text-sm text-muted-foreground mb-3 truncate">
                  {user.email}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}