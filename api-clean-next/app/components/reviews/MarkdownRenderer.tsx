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
      className={[
        'markdown-content',
        'prose prose-slate dark:prose-invert max-w-none w-full',

        // Paragraphs
        'prose-p:text-[15px] prose-p:leading-relaxed prose-p:mb-4 prose-p:text-foreground/90',

        // Links
        'prose-a:text-primary prose-a:font-medium prose-a:underline-offset-4 hover:prose-a:text-primary/80',

        // Headings
        'prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground',
        'prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4 prose-h1:pb-2 prose-h1:border-b prose-h1:border-border/50',
        'prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-1.5 prose-h2:border-b prose-h2:border-border/40',
        'prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2',

        // Lists
        'prose-ul:ml-2 prose-ul:my-4 prose-ol:ml-2 prose-ol:my-4',
        'prose-li:text-[15px] prose-li:text-foreground/90 prose-li:marker:text-muted-foreground prose-li:my-1',

        // Inline code — overridden by .markdown-content :not(pre) > code in globals.css
        'prose-code:before:content-none prose-code:after:content-none',

        // Code blocks — handled by .hljs-block in globals.css; disable prose defaults
        'prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none prose-pre:border-0 prose-pre:rounded-none prose-pre:my-0',

        // Blockquote — handled by .markdown-content blockquote in globals.css
        'prose-blockquote:not-italic prose-blockquote:border-0 prose-blockquote:p-0',

        // Strong / em
        'prose-strong:font-semibold prose-strong:text-foreground',
        'prose-em:text-foreground/80',

        className ?? '',
      ].join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
