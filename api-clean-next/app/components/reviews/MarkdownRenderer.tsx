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
        prose prose-slate dark:prose-invert max-w-none w-full

        /* Tipografia Base mais legível */
        prose-p:text-[15px] prose-p:leading-relaxed prose-p:mb-5 prose-p:text-foreground/90
        prose-a:text-primary prose-a:font-medium prose-a:underline-offset-4 hover:prose-a:text-primary/80

        /* Títulos com melhor hierarquia */
        prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
        prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
        prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2

        /* Listas mais limpas */
        prose-ul:ml-2 prose-ol:ml-2 prose-li:text-[15px] prose-li:text-foreground/90 prose-li:marker:text-muted-foreground

        /* Blocos de Código (estilo Dev) */
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
        prose-code:text-[13px] prose-code:bg-muted/50 prose-code:font-mono prose-code:text-foreground/80
        prose-code:before:content-none prose-code:after:content-none
        prose-code:break-words

        /* Pre (Blocos maiores de código) */
        prose-pre:bg-[#1A1A1A] dark:prose-pre:bg-[#0D0D0D]
        prose-pre:border prose-pre:border-border/10
        prose-pre:rounded-xl
        prose-pre:p-4
        prose-pre:overflow-x-auto
        prose-pre:max-w-full
        prose-pre:text-[13px]
        prose-pre:shadow-sm
        prose-pre:!my-6 /* Força margem para afastar do texto */

        /* Citações mais elegantes */
        prose-blockquote:border-l-4 prose-blockquote:border-primary/50
        prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:pl-5
        prose-blockquote:italic prose-blockquote:text-muted-foreground
        prose-blockquote:rounded-r-lg
        prose-blockquote:my-6

        /* Ajustes de Imagem se houver */
        prose-img:rounded-xl prose-img:shadow-sm prose-img:border prose-img:border-border/50

        ${className || ''}
      `}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}