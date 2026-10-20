export interface NavItem {
  href: string
  label: string
}

// Home has no tab of its own: the avatar in the header goes there, as on b-r.io.
export const NAV_ITEMS: NavItem[] = [
  { href: '/about', label: 'About' },
  { href: '/library', label: 'Library' },
  { href: '/notes', label: 'Notes' },
  { href: '/music', label: 'Music' },
  { href: '/games', label: 'Games' },
  { href: '/studies', label: 'Studies' },
]

/** The footer keeps an explicit way home for whoever reads to the end. */
export const FOOTER_ITEMS: NavItem[] = [{ href: '/', label: 'Home' }, ...NAV_ITEMS]

/** Home only matches itself; every other section also owns its sub-pages. */
export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}
