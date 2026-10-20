import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'

export const SOCIALS = [
    { label: 'GitHub', long: 'Follow on GitHub', href: 'https://github.com/humbertovitalino', icon: FiGithub },
    { label: 'LinkedIn', long: 'Connect on LinkedIn', href: 'https://www.linkedin.com/in/humbertovitalino', icon: FiLinkedin },
] as const

export const EMAIL = 'humbertovitalino01@gmail.com'

/** The row of icons under the home bio. */
export function SocialIcons() {
    return (
        <div className="mt-6 flex gap-6">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="group -m-1 p-1">
                    <Icon className="size-5.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                </a>
            ))}
            <a href={`mailto:${EMAIL}`} aria-label="Email" className="group -m-1 p-1">
                <FiMail className="size-5.5 text-muted-foreground transition-colors group-hover:text-foreground" />
            </a>
        </div>
    )
}

/** The labelled list on the About page. */
export function SocialList() {
    return (
        <ul>
            {SOCIALS.map(({ label, long, href, icon: Icon }, i) => (
                <li key={label} className={i > 0 ? 'mt-4 flex' : 'flex'}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center text-sm font-medium transition-colors hover:text-brand-accent">
                        <Icon className="size-5.5 shrink-0 text-muted-foreground transition-colors group-hover:text-brand-accent" />
                        <span className="ml-4">{long}</span>
                    </a>
                </li>
            ))}
            <li className="mt-8 flex border-t border-border pt-8">
                <a href={`mailto:${EMAIL}`} className="group flex items-center text-sm font-medium transition-colors hover:text-brand-accent">
                    <FiMail className="size-5.5 shrink-0 text-muted-foreground transition-colors group-hover:text-brand-accent" />
                    <span className="ml-4">{EMAIL}</span>
                </a>
            </li>
        </ul>
    )
}
