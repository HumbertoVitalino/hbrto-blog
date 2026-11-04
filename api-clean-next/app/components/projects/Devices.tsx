import type { Shot } from '@/lib/projects'
import { cn } from '@/lib/utils'

/** Both themes' images; CSS shows the one that matches the site, so there's no flash on load. */
function ThemedShot({ shot, priority, className }: { shot: Shot; priority?: boolean; className?: string }) {
    const common = {
        width: shot.width,
        height: shot.height,
        loading: priority ? ('eager' as const) : ('lazy' as const),
        decoding: 'async' as const,
        draggable: false,
    }
    return (
        <>
            <img {...common} src={shot.light} alt={shot.alt} className={cn('block h-auto w-full dark:hidden', className)} />
            <img {...common} src={shot.dark} alt={shot.alt} className={cn('hidden h-auto w-full dark:block', className)} />
        </>
    )
}

export function BrowserWindow({ shot, priority, flushBottom, className, imageClassName }: {
    shot: Shot
    /** square bottom corners, for a window cropped by its stage */
    flushBottom?: boolean
    priority?: boolean
    className?: string
    imageClassName?: string
}) {
    return (
        <div className={cn('device-window', flushBottom && 'device-window-flush', className)}>
            <div aria-hidden className="flex h-7 items-center gap-1.5 border-b border-border bg-muted/70 px-3">
                <i className="size-2.5 rounded-full bg-muted-foreground/30" />
                <i className="size-2.5 rounded-full bg-muted-foreground/30" />
                <i className="size-2.5 rounded-full bg-muted-foreground/30" />
            </div>
            <ThemedShot shot={shot} priority={priority} className={imageClassName} />
        </div>
    )
}

export function Phone({ shot, priority, className }: { shot: Shot; priority?: boolean; className?: string }) {
    return (
        <div className={cn('device-phone relative', className)}>
            <div className="device-phone-screen">
                <ThemedShot shot={shot} priority={priority} className="h-full object-cover object-top" />
            </div>
        </div>
    )
}

/** A desktop screen with a phone resting over its right edge, both cropped by the stage. */
export function ProductStage({ desktop, phone, priority, settle, className }: {
    desktop: Shot
    phone: Shot
    priority?: boolean
    /** flatten in from a tilt as the stage scrolls into view */
    settle?: boolean
    className?: string
}) {
    return (
        <div className={cn('product-stage px-5 pt-7 sm:px-14 sm:pt-14', settle && 'product-settle', className)}>
            <BrowserWindow shot={desktop} priority={priority} className="-mb-[6%] w-full sm:w-[88%]" />
            <Phone shot={phone} priority={priority} className="absolute -bottom-[14%] right-[3%] w-[34%] sm:-bottom-[8%] sm:right-[4.5%] sm:w-[23%]" />
        </div>
    )
}
