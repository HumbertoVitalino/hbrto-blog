/** A screenshot taken in both themes; the site shows whichever matches its own. */
export interface Shot {
    light: string
    dark: string
    width: number
    height: number
    alt: string
}

export interface Project {
    slug: string
    name: string
    context: string
    period: string
    summary: string
    tags: string[]
    /** the desktop screen and the phone screen that open the project */
    desktop: Shot
    phone: Shot
}

const dir = '/projects/fiap-workshop'

export const FIAP_SHOTS = {
    board: {
        light: `${dir}/admin-desktop-light.webp`, dark: `${dir}/admin-desktop-dark.webp`, width: 2400, height: 1500,
        alt: 'The admin dashboard: every open service order pinned to a shadow board by stage, with plates, customers and how long each has waited.',
    },
    boardPhone: {
        light: `${dir}/admin-mobile-light.webp`, dark: `${dir}/admin-mobile-dark.webp`, width: 780, height: 1688,
        alt: 'The same dashboard on a phone, stages stacked.',
    },
    track: {
        light: `${dir}/track-mobile-light.webp`, dark: `${dir}/track-mobile-dark.webp`, width: 780, height: 1688,
        alt: 'A customer tracking their order on a phone: the stage, the diagnosis and the itemized quote.',
    },
    order: {
        light: `${dir}/order-desktop-light.webp`, dark: `${dir}/order-desktop-dark.webp`, width: 2000, height: 1667,
        alt: 'A service order in progress: the six stages, the next action asking for the real minutes spent on each service, and the itemized quote.',
    },
} satisfies Record<string, Shot>

// newest first
export const PROJECTS: Project[] = [
    {
        slug: 'fiap-workshop',
        name: 'Fiap Workshop',
        context: 'FIAP postgrad',
        period: '2026 — Present',
        summary:
            'Runs a car repair shop from drop-off to delivery. A DDD backend in .NET 10 with a full service-order state machine, deployed to Kubernetes on Azure, and a screen for every role in the shop.',
        tags: ['.NET 10', 'DDD', 'Kubernetes', 'Terraform', 'Next.js'],
        desktop: FIAP_SHOTS.board,
        phone: FIAP_SHOTS.track,
    },
]
