'use client'

import { MarkdownRenderer } from "./MarkdownRenderer"

interface MarkdownPreviewProps {
  text: string
  showPreview?: boolean
}

export function MarkdownPreview({ text, showPreview = true }: MarkdownPreviewProps) {
  if (!showPreview || !text) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Preview</p>

      <div className="bg-muted p-4 rounded-md border border-border">
        <MarkdownRenderer content={text} />
      </div>
    </div>
  )
}