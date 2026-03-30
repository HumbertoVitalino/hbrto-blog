import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
    html: false, // Don't allow raw HTML for security
    linkify: true, // Auto-detect URLs
    typographer: true, // Nice typography
    breaks: true, // Convert line breaks to <br>
})

/**
 * Parse markdown text to HTML
 * Supports all standard markdown features:
 * - Headings: # H1, ## H2, ### H3
 * - Lists: - bullet, 1. numbered
 * - Code: `inline` or ```blocks```
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Links: [text](url)
 * - Blockquotes: > text
 * - Horizontal rules: ---, ***, ___
 */
export function parseMarkdown(markdown: string): string {
    if (!markdown || typeof markdown !== 'string') {
        return ''
    }

    try {
        const html = md.render(markdown)
        return html.trim()
    } catch (error) {
        console.error('Markdown parsing error:', error)
        return markdown
    }
}

/**
 * Sanitize markdown output
 * Safe because markdown-it has html: false
 */
export function sanitizeMarkdown(markdown: string): string {
    return parseMarkdown(markdown)
}
