'use client'

import { parseMarkdown } from '@/lib/markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = parseMarkdown(content)

  return (
    <div
      className={`
                prose prose-sm dark:prose-invert max-w-none

                prose-p:leading-relaxed prose-p:mb-3

                prose-h1:text-base prose-h1:font-semibold
                prose-h2:text-sm prose-h2:font-semibold
                prose-h3:text-xs prose-h3:font-semibold

                prose-ul:ml-4 prose-ol:ml-4

                prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-code:text-xs prose-code:bg-muted
                prose-code:break-word

                prose-pre:bg-muted
                prose-pre:border
                prose-pre:border-border
                prose-pre:rounded-md
                prose-pre:p-3
                prose-pre:overflow-x-auto
                prose-pre:max-w-full
                prose-pre:text-xs

                prose-blockquote:border-l-2
                prose-blockquote:pl-3
                prose-blockquote:italic

                ${className || ''}
            `}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}