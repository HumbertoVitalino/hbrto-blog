'use client'

interface SocialFooterProps {
  label?: string
}

export function SocialFooter({ label = 'Connect' }: SocialFooterProps) {
  return (
    <footer className="border-t py-6">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <div className="flex items-center gap-6">
          <a
            href="https://www.linkedin.com/in/humbertovitalino"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            LinkedIn
          </a>

          <a
            href="mailto:humbertovitalino@gmail.com"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  )
}
