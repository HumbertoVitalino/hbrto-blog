export interface NavItem {
  href: string
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/library', label: 'Library' },
  { href: '/notes', label: 'Notes' },
  { href: '/music', label: 'Music' },
  { href: '/games', label: 'Games' },
  { href: '/studies', label: 'Studies' },
  { href: '/release-notes', label: 'Releases' },
]

/** Home only matches itself; every other section also owns its sub-pages. */
export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}
