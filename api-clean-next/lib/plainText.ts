/** Strips markdown syntax down to plain text — used for one-line previews, not for rendering. */
export function stripMarkdown(markdown: string): string {
    if (!markdown || typeof markdown !== 'string') return ''
    return markdown
        .replace(/```[\s\S]*?```/g, ' ')       // fenced code blocks
        .replace(/`([^`]+)`/g, '$1')            // inline code
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '') // images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
        .replace(/^#{1,6}\s+/gm, '')             // headings
        .replace(/^>\s?/gm, '')                  // blockquotes
        .replace(/^[-*+]\s+/gm, '')              // list markers
        .replace(/^\d+\.\s+/gm, '')              // ordered list markers
        .replace(/(\*\*|__)(.*?)\1/g, '$2')      // bold
        .replace(/(\*|_)(.*?)\1/g, '$2')         // italic
        .replace(/~~(.*?)~~/g, '$1')             // strikethrough
        .replace(/\s+/g, ' ')                    // collapse whitespace/newlines
        .trim()
}
