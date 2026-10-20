import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Notes on what I read, play and build.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
