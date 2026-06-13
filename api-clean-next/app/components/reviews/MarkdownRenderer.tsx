'use client'

import { parseMarkdown } from '@/lib/markdown'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = parseMarkdown(content)

  return (
    <div
      className={cn('markdown-content', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
