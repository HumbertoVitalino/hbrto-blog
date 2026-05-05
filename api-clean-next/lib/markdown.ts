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
