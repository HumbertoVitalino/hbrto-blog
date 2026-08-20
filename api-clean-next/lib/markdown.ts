import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

function highlight(str: string, lang: string): string {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
    try {
        const highlighted = hljs.highlight(str, { language, ignoreIllegals: true }).value
        return `<pre class="hljs-block"><code class="hljs language-${language}">${highlighted}</code></pre>`
    } catch {
        return `<pre class="hljs-block"><code class="hljs">${MarkdownIt().utils.escapeHtml(str)}</code></pre>`
    }
}

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight,
})

export function parseMarkdown(markdown: string): string {
    if (!markdown || typeof markdown !== 'string') return ''
    try {
        return md.render(markdown).trim()
    } catch {
        return markdown
    }
}

export function sanitizeMarkdown(markdown: string): string {
    return parseMarkdown(markdown)
}

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
