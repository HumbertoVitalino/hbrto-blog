'use client'

import { useState, type ReactNode } from 'react'
import type { NoteLanguage } from '@/domain/Note'
import { LANGUAGE_LABEL } from '@/lib/notes'
import { cn } from '@/lib/utils'

export interface NoteVersion {
  language: NoteLanguage
  title: string
  /** Rendered on the server from the note's markdown. */
  html: string
}

/** The note's header and text, with a language switch when it was written in more than one. */
export function NoteBody({ versions, date, meta }: {
  versions: NoteVersion[]
  /** The <time> line above the title. */
  date: ReactNode
  /** What sits under the title: citations, admin actions. */
  meta?: ReactNode
}) {
  const [language, setLanguage] = useState(versions[0].language)
  const version = versions.find(v => v.language === language) ?? versions[0]

  return (
    <div lang={version.language}>
      <header className="flex flex-col">
        <h1 className="text-[2rem] font-semibold leading-10 tracking-tight text-balance sm:text-5xl sm:leading-14">
          {version.title}
        </h1>
        <div className="order-first mb-6">{date}</div>
        {meta}
        {versions.length > 1 && (
          <div role="group" aria-label="Read in" className="mt-6 inline-flex self-start rounded-full bg-muted p-0.5">
            {versions.map(v => (
              <button
                key={v.language}
                type="button"
                lang={v.language}
                aria-pressed={v.language === language}
                onClick={() => setLanguage(v.language)}
                className={cn(
                  'rounded-full px-3 py-1 text-[13px] font-medium leading-6 transition-colors',
                  v.language === language ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {LANGUAGE_LABEL[v.language]}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="prose-note mt-10" dangerouslySetInnerHTML={{ __html: version.html }} />
    </div>
  )
}
